## 🔴 Book Requests Badge Implementation

### Summary
Added a red badge count to the "Book Requests" button in the admin dashboard that displays the number of pending book requests.

### Features Implemented

#### 1. **Backend Integration**
- ✅ Fetches pending request count from `/api/requests` endpoint
- ✅ Filters requests with `status === 'pending'`
- ✅ Uses existing `fetchWithTimeout` for reliable API calls

#### 2. **Badge Display**
- ✅ Red circular badge positioned at top-right of "Book Requests" menu item
- ✅ Badge shows numeric count (e.g., "3", "5")
- ✅ Badge hides automatically when no pending requests
- ✅ Styled with CSS for better visibility

#### 3. **Auto-Update Functionality**
- ✅ Updates on page load (DOMContentLoaded)
- ✅ Updates every 30 seconds (auto-refresh)
- ✅ Updates after approving a request
- ✅ Updates after rejecting a request

### Files Modified

1. **public/admin-dashboard.html**
   - Added CSS for `.request-badge` class
   - Added badge span element to "Book Requests" menu item
   - Badge styled as red circle with white text

2. **public/admin-dashboard.js**
   - Added `updateRequestBadge()` function to fetch and display count
   - Updated DOMContentLoaded to:
     - Call updateRequestBadge() on page load
     - Set interval for 30-second auto-refresh
     - Fix text extraction for sidebar navigation (ignore badge in text)
   - Updated `approveRequest()` to call updateRequestBadge()
   - Updated `rejectRequest()` to call updateRequestBadge()

### Function Details

#### updateRequestBadge()
```javascript
async function updateRequestBadge() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetchWithTimeout('/api/requests', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) return;

    const requests = await response.json();
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    
    // Update badge in sidebar
    const badge = document.getElementById('requestBadge');
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error fetching request count:', error);
  }
}
```

### How It Works

1. **Page Load**: Badge count is fetched and displayed when admin dashboard loads
2. **Auto-Refresh**: Every 30 seconds, the count is updated automatically
3. **After Action**: When admin approves or rejects a request, badge is immediately updated
4. **Smart Display**: Badge only shows if there are pending requests

### Testing

To test the feature:
1. Navigate to Admin Dashboard
2. You should see a red badge with count on "Book Requests" menu item
3. Click "Book Requests" to see the pending requests
4. Approve or reject a request - badge count should decrease
5. Leave dashboard open for 30+ seconds - badge should auto-update

### Benefits

✅ **Real-time Visibility**: Admins always see pending request count
✅ **No Manual Refresh**: Auto-updates every 30 seconds
✅ **Immediate Feedback**: Updates instantly after approval/rejection
✅ **Non-intrusive**: Discreet red badge that only shows when needed
✅ **Reliable**: Uses existing fetchWithTimeout for timeout handling
