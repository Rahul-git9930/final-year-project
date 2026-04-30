import cv2
import requests
import time
import sys
import json

BASE_URL = "http://localhost:5000"
BACKEND_URL = f"{BASE_URL}/api/external-scan"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
ISSUE_URL = f"{BASE_URL}/api/requests/issue"
BOOKS_URL = f"{BASE_URL}/api/books"

# Take IP from command line if provided, else prompt for it or use last default
if len(sys.argv) > 1:
    ESP32_IP = sys.argv[1]
else:
    print("--------------------------------------------------")
    print("Please enter the ESP32 Camera IP Address (e.g. 192.168.1.15).")
    print("Press Enter to use the default (10.118.100.240)")
    user_input = input("ESP32 IP > ").strip()
    ESP32_IP = user_input if user_input else "10.118.100.240"

# Attempt to login as test student to get token for direct requests
print("\n🔑 Logging in as test student...")
auth_token = None
try:
    login_res = requests.post(LOGIN_URL, json={
        "email": "test.student@library.com",
        "password": "Student@123"
    }, timeout=5)
    if login_res.status_code == 200:
        auth_token = login_res.json().get('token')
        print("✅ Logged in successfully!")
    else:
        print("⚠️  Failed to login. Manual issue requests won't work.")
except Exception as e:
    print(f"❌ Login error: {e}")

STREAM_URL = f"http://{ESP32_IP}:81/stream"

print(f"\n📡 Connecting to ESP32 stream at: {STREAM_URL}")
# Open stream
cap = cv2.VideoCapture(STREAM_URL)

if not cap.isOpened():
    print("❌ Cannot open stream")
    exit()

print("✅ Stream started. Scanning for QR codes. Press ESC to exit")

# Initialize OpenCV's built-in QR code detector
detector = cv2.QRCodeDetector()

# We will display these on the video feed
last_book_title = ""
last_scan_status = ""

while True:
    ret, frame = cap.read()

    if not ret:
        print("❌ Frame error")
        break

    # Resize to process faster and view easily
    frame = cv2.resize(frame, (640, 480))

    # Detect and decode QR codes in the current frame
    data, bbox, _ = detector.detectAndDecode(frame)

    if bbox is not None:
        # Check if we actually decoded any QR data
        if data:
            current_time = time.time()
            # Debounce 3 seconds
            if data != getattr(cap, 'last_seen_data', None) or (current_time - getattr(cap, 'last_seen_time', 0) > 3):
                cap.last_seen_data = data
                cap.last_seen_time = current_time
                print(f"\n======================================")
                print(f"✅ QR Code Detected: {data}")
                
                # 1. Parse JSON to get bookId
                book_id = None
                try:
                    # Clean up data if needed
                    clean_data = data.strip().strip('"').strip("'")
                    if "{" in clean_data:
                        qr_json = json.loads(clean_data)
                        book_id = qr_json.get("bookId")
                    else:
                        book_id = clean_data # raw ID
                except Exception:
                    book_id = data
                
                # 2. Fetch Book Details
                if book_id:
                    try:
                        book_res = requests.get(f"{BOOKS_URL}/{book_id}", timeout=3)
                        if book_res.status_code == 200:
                            book = book_res.json()
                            print(f"📖 Book Details:")
                            print(f"   ➤ Title:  {book.get('title')}")
                            print(f"   ➤ Author: {book.get('author')}")
                            print(f"   ➤ Stock:  {book.get('available')} available")
                            last_book_title = book.get('title', 'Unknown Book')
                        else:
                            last_book_title = f"ID: {book_id}"
                    except Exception as e:
                        last_book_title = f"ID: {book_id}"

                    # 3. Create Issue Request (send to admin)
                    if auth_token:
                        print("⏳ Sending request to Admin...")
                        try:
                            headers = {"Authorization": f"Bearer {auth_token}"}
                            req_res = requests.post(ISSUE_URL, headers=headers, json={"bookId": book_id}, timeout=4)
                            if req_res.status_code in [200, 201]:
                                print("✅ Request sent to Admin successfully!")
                                last_scan_status = "Request Sent!"
                            else:
                                err_msg = req_res.json().get('message', req_res.text)
                                print(f"⚠️  Could not send request: {err_msg}")
                                last_scan_status = "Request Failed"
                        except Exception as e:
                            print(f"❌ Network error when requesting: {e}")
                            last_scan_status = "Network Error"
                    
                    # 4. Optional: forward to SSE Dashboard if active
                    try:
                        resp = requests.post(BACKEND_URL, json={"qrData": data}, timeout=2)
                        if resp.status_code == 200:
                            print("✅ Also forwarded to Web Dashboard")
                    except Exception:
                        pass
                print(f"======================================\n")

            # Draw text on the frame
            display_text = f"Book: {last_book_title}" if last_book_title else str(data)
            cv2.putText(frame, display_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            if last_scan_status:
                status_color = (0, 255, 0) if "Sent" in last_scan_status else (0, 0, 255)
                cv2.putText(frame, last_scan_status, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
            
        # Draw bounding boxes around the QR code
        for i in range(len(bbox[0])):
            pt1 = tuple(map(int, bbox[0][i]))
            pt2 = tuple(map(int, bbox[0][(i+1) % len(bbox[0])]))
            cv2.line(frame, pt1, pt2, color=(0, 255, 0), thickness=2)

    cv2.imshow("ESP32-CAM QR Scanner", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC key
        break

cap.release()
cv2.destroyAllWindows()