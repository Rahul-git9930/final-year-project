# Student Dashboard - Visual Navigation Guide

## Dashboard Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  📚 LibraryMS                                    🔔(unread) │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SIDEBAR              │ CONTENT AREA                         │
│  ─────────────        │ ────────────────────────────         │
│                       │                                       │
│  📊 Dashboard*        │ Welcome back, Student! 👋             │
│                       │ Here's your library activity          │
│  🔍 Search Books      │                                       │
│                       │ ┌──────┬──────┬──────┬──────┐        │
│  📚 My Books          │ │ 📚   │ ⏳   │ 💰   │ 📖   │        │
│                       │ │ 3    │ 1    │ ₹50  │ 12   │        │
│  ❤️ Wishlist          │ │Books │Due   │Fines │Books │        │
│                       │ │ Iss. │Soon  │Unpd. │Read  │        │
│  💸 Fines & Payments  │ └──────┴──────┴──────┴──────┘        │
│                       │                                       │
│  📜 History           │ Currently Issued Books                │
│                       │ ┌────────────────────────────────────┤
│  👤 Profile           │ │ Book Title  │Due Date│Status│Action│
│                       │ ├────────────────────────────────────┤
│  Logout               │ │ Harry Potter│23 Dec │ Due  │Renew │
│                       │ │             │       │      │Return│
│                       │ └────────────────────────────────────┘
│                       │
└─────────────────────────────────────────────────────────────┘
```

## Page Flow Diagram

```
                       ┌──────────────┐
                       │   LOGIN      │
                       │   PAGE       │
                       └──────┬───────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
           ┌────────▼────────┐  ┌──────▼────────┐
           │   ADMIN ROLE    │  │ STUDENT ROLE  │
           │   (admin/lib)   │  │ (student/mem) │
           └────────┬────────┘  └──────┬────────┘
                    │                  │
           ┌────────▼────────┐  ┌──────▼────────────┐
           │  ADMIN SIDEBAR  │  │ STUDENT SIDEBAR   │
           ├─────────────────┤  ├───────────────────┤
           │ Dashboard       │  │ Dashboard         │
           │ Books           │  │ Search Books      │
           │ Users           │  │ My Books          │
           │ Transactions    │  │ Wishlist          │
           │ Fines           │  │ Fines & Payments  │
           │ Reports         │  │ History           │
           │ Settings        │  │ Profile           │
           └─────────────────┘  └───────────────────┘
                    │                  │
         ┌──────────┼──────────┐     ┌─┴────────────┐
         │          │          │     │ (8 different │
         │          │          │     │  student     │
         │          │          │     │  pages)      │
         ▼          ▼          ▼     ▼              
    Admin    Users  Trans.  Fine  Stud.Pages
    Dash.    Mgmt.  Mgmt.   Mgmt. (See below)
```

## Student Pages Navigation Map

```
┌─ DASHBOARD (Home Page)
│  ├─ 4 Metric Cards (Books Issued, Due Soon, Pending Fines, Books Read)
│  ├─ Currently Issued Books Table
│  └─ Notification Bell → Notifications Page
│
├─ SEARCH BOOKS
│  ├─ Search by Title
│  ├─ Search by Author
│  ├─ Filter by Category
│  └─ Books Grid
│     ├─ Click "Request" → Add to Wishlist
│     └─ Click "Details" → Book Details Page
│
├─ MY BOOKS
│  ├─ Currently Issued Section
│  │  ├─ Renew Button
│  │  └─ Return Button
│  └─ Reading History Section
│
├─ WISHLIST
│  ├─ Wishlist Items Grid
│  ├─ "Request" (if available)
│  └─ "Remove" Button
│
├─ FINES & PAYMENTS
│  ├─ Metric Cards (Total Fines, Unpaid)
│  ├─ Unpaid Fines Table
│  │  └─ "Pay Now" Button
│  └─ Paid Fines History
│
├─ HISTORY
│  └─ Complete Transactions Table
│
├─ PROFILE
│  ├─ Editable Fields (Phone, Address)
│  ├─ Read-only Fields (Name, Email, Role, Status)
│  ├─ "Update Profile" Button
│  └─ "Change Password" Button
│
└─ NOTIFICATIONS (Bell Icon)
   ├─ Notification List
   ├─ "Mark as Read" (per notification)
   └─ "Mark All as Read"
```

## Student Dashboard Home (Detailed)

```
┌────────────────────────────────────────────────────────────┐
│ Welcome back, Student Name! 👋                    🔔 3     │
│ Here's your library activity overview                       │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     📚       │  │      ⏳       │  │      💰      │      │
│  │              │  │              │  │              │      │
│  │   Books      │  │    Due       │  │   Pending    │      │
│  │   Issued     │  │    Soon      │  │   Fines      │      │
│  │              │  │              │  │              │      │
│  │      3       │  │      1       │  │    ₹50.00    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐                                           │
│  │      📖      │                                           │
│  │              │                                           │
│  │   Total      │                                           │
│  │   Books      │                                           │
│  │    Read      │                                           │
│  │              │                                           │
│  │     12       │                                           │
│  └──────────────┘                                           │
│                                                              │
├────────────────────────────────────────────────────────────┤
│ 📚 Currently Issued Books                                   │
├──────────────┬──────────┬──────────┬────────┬───────────────┤
│ Book         │ Issued   │ Due Date │ Status │ Actions       │
├──────────────┼──────────┼──────────┼────────┼───────────────┤
│ Harry Potter │ 15 Dec   │ 23 Dec   │ Due    │ Renew Return  │
│ Sherlock     │ 18 Dec   │ 26 Dec   │ Issued │ Renew Return  │
│ LOTR         │ 10 Dec   │ 18 Dec   │OVERDUE │ Renew Return  │
└──────────────┴──────────┴──────────┴────────┴───────────────┘
```

## Search Books Page

```
┌────────────────────────────────────────────────────────────┐
│ Search & Browse Books 📚                                   │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ Search by title  │ │ Search by author │ │ Category ▼   │ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                    SEARCH BUTTON                       │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   📖        │  │   📖        │  │   📖        │      │
│  │   Title      │  │   Title      │  │   Title      │      │
│  │   by Author  │  │   by Author  │  │   by Author  │      │
│  │   Category   │  │   Category   │  │   Category   │      │
│  │   ✓ Avail.   │  │   ✗ Not Avl. │  │   ✓ Avail.   │      │
│  │ [Request] D. │  │ [Wishlist] D.│  │ [Request] D. │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  (Grid continues with more books...)                        │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## My Books Page Structure

```
┌────────────────────────────────────────────────────────────┐
│ My Books 📚                                                 │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ Currently Issued (3)                                        │
│ ┌──────────┬────────┬────────┬──────────┬────────────────┐ │
│ │ Book     │ Author │ Issue  │ Due      │ Days / Actions │ │
│ ├──────────┼────────┼────────┼──────────┼────────────────┤ │
│ │ Harry P. │ Rowling│ 15 Dec │ 23 Dec   │ 2 days │ Renew│ │
│ │ Sherlock │ Doyle  │ 18 Dec │ 26 Dec   │ 4 days │Renew│ │
│ │ LOTR     │Tolkien │ 10 Dec │ 18 Dec   │-5 OVERDUE│Renew│ │
│ └──────────┴────────┴────────┴──────────┴────────────────┘ │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ Reading History (12)                                        │
│ ┌──────────┬────────┬──────────────┐                       │
│ │ Book     │ Author │ Returned     │                       │
│ ├──────────┼────────┼──────────────┤                       │
│ │ Dune     │ Herbert│ 15 Dec 2024  │                       │
│ │ Sapiens  │ Harari │ 10 Dec 2024  │                       │
│ │ 1984     │ Orwell │ 05 Dec 2024  │                       │
│ │ ...      │ ...    │ ...          │                       │
│ └──────────┴────────┴──────────────┘                       │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Wishlist Page

```
┌────────────────────────────────────────────────────────────┐
│ My Wishlist ❤️                                             │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   📖        │  │   📖        │  │   📖        │      │
│  │   Title      │  │   Title      │  │   Title      │      │
│  │   by Author  │  │   by Author  │  │   by Author  │      │
│  │   Category   │  │   Category   │  │   Category   │      │
│  │ ✓ Available! │  │ ✗ Not Avail. │  │ ✓ Available! │      │
│  │ Now (3 cop)  │  │              │  │  (2 copies)  │      │
│  │ [Request]    │  │ [Remove]     │  │ [Request]    │      │
│  │ Added: 2024  │  │ Added: 2024  │  │ Added: 2024  │      │
│  │              │  │ [Remove]     │  │ [Remove]     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  (More wishlist items...)                                   │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Fines & Payments Page

```
┌────────────────────────────────────────────────────────────┐
│ Fines & Payments 💸                                         │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │     💰      │  │      ⏳       │                        │
│  │              │  │              │                        │
│  │   Total      │  │    Unpaid    │                        │
│  │   Fines      │  │              │                        │
│  │              │  │              │                        │
│  │  ₹150.00     │  │   ₹50.00     │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ Unpaid Fines (2)                                            │
│ ┌──────────────┬────────┬────────┬─────────────────────┐   │
│ │ Reason       │ Amount │ Date   │ Action              │   │
│ ├──────────────┼────────┼────────┼─────────────────────┤   │
│ │ Overdue: 5 d │ ₹25.00 │ 21 Dec │ [Pay Now]           │   │
│ │ Overdue: 2 d │ ₹25.00 │ 24 Dec │ [Pay Now]           │   │
│ └──────────────┴────────┴────────┴─────────────────────┘   │
│                                                              │
│ Paid Fines (3)                                              │
│ ┌──────────────┬────────┬──────────────┐                   │
│ │ Reason       │ Amount │ Paid Date    │                   │
│ ├──────────────┼────────┼──────────────┤                   │
│ │ Overdue: 3 d │ ₹15.00 │ 18 Dec 2024  │                   │
│ │ Overdue: 4 d │ ₹20.00 │ 12 Dec 2024  │                   │
│ │ Overdue: 6 d │ ₹30.00 │ 05 Dec 2024  │                   │
│ └──────────────┴────────┴──────────────┘                   │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Profile Page

```
┌────────────────────────────────────────────────────────────┐
│ My Profile 👤                                               │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ Name (Read-only)                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Student Name                           [disabled]      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Email (Read-only)                                           │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ student@example.com                    [disabled]      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Phone (Editable)                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 9876543210                                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Address (Editable)                                          │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 123 Main Street                                        │ │
│ │ City, State 12345                                      │ │
│ │                                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Role (Read-only)                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Student                                [disabled]      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Membership Status (Read-only)                               │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Active ✓                               [disabled]      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [UPDATE PROFILE]                                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [CHANGE PASSWORD]                                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Notifications Page

```
┌────────────────────────────────────────────────────────────┐
│ Notifications 🔔                                            │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [MARK ALL AS READ]                                     │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📢 Book Issue Confirmed                                │ │
│ │ Your request for "Harry Potter" has been approved.    │ │
│ │ Please collect the book from the library.              │ │
│ │ 25 Dec 2024, 2:30 PM                                   │ │
│ │ [Mark as Read]                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⏰ Book Due Soon                                        │ │
│ │ "Sherlock Holmes" is due in 2 days. Please return on  │ │
│ │ time to avoid late fees.                               │ │
│ │ 24 Dec 2024, 10:15 AM                                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 💰 Fine Generated                                       │ │
│ │ You have an overdue fine of ₹25.00 for "LOTR".        │ │
│ │ Please pay at the library counter.                     │ │
│ │ 23 Dec 2024, 3:45 PM                                   │ │
│ │ [Mark as Read]                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ (More notifications follow...)                              │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Book Details Page (from Search)

```
┌────────────────────────────────────────────────────────────┐
│ [← BACK]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌─────────────────────────────────────┐     │
│  │          │  │ Harry Potter and the Philosopher    │     │
│  │   📖    │  │ Stone                                │     │
│  │          │  │                                     │     │
│  │          │  │ by J.K. Rowling                     │     │
│  │ Cover    │  │                                     │     │
│  │ Image    │  │ Published by Bloomsbury             │     │
│  │          │  │                                     │     │
│  │          │  │ ✓ Available (5 copies)              │     │
│  │          │  │                                     │     │
│  │          │  │ Average Rating: 4.8 ⭐             │     │
│  │          │  │                                     │     │
│  │          │  │ Description:                        │     │
│  │          │  │ The first book in the Harry Potter  │     │
│  │          │  │ series follows the young wizard...  │     │
│  │          │  │                                     │     │
│  │          │  │ ┌─────────────────────────────────┐ │     │
│  │          │  │ │ REQUEST THIS BOOK               │ │     │
│  │          │  │ └─────────────────────────────────┘ │     │
│  │          │  │                                     │     │
│  └──────────┘  └─────────────────────────────────────┘     │
│                                                              │
├────────────────────────────────────────────────────────────┤
│ Reviews (12)                                                │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ John Doe                         ⭐⭐⭐⭐⭐             │ │
│ │ Amazing book! One of the best. Highly recommended.     │ │
│ │ 20 Dec 2024                                            │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Jane Smith                       ⭐⭐⭐⭐              │ │
│ │ Great start to the series. Engaging from beginning.    │ │
│ │ 18 Dec 2024                                            │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ (More reviews...)                                           │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Color Scheme Reference

```
Status Indicators:
├─ Available (Green): #d4edda background, #155724 text
├─ Unavailable (Red): #f8d7da background, #721c24 text
├─ Active (Dark Green): #0f5132 (buttons)
├─ Secondary Action: #198754 (green buttons)
├─ Overdue (Red): #dc3545 text
├─ Due Soon (Orange): #ffc107 text
├─ Neutral (Gray): #6c757d
└─ Info (Blue): #e7f3ff background

Buttons:
├─ Primary Action: Dark Green (#0f5132)
├─ Secondary Action: Green (#198754)
├─ Danger/Remove: Red (#dc3545)
├─ Back/Cancel: Gray (#6c757d)
└─ Disabled: Light Gray (#f5f5f5)

Text:
├─ Headings: #0f5132
├─ Normal: Black
├─ Secondary: #666
├─ Disabled: #999
└─ Light: #ddd
```

## Responsive Breakpoints

```
Desktop (≥1024px):
- 3-column book grid
- Full sidebar visible
- 2-column forms

Tablet (768px - 1023px):
- 2-column book grid
- Full sidebar visible
- Single column forms

Mobile (<768px):
- 1-column book grid
- Sidebar may collapse (future)
- Single column everything
```

---

**Visual Guide Created**: 2024
**Status**: Reference complete ✅
**Last Updated**: Current implementation
