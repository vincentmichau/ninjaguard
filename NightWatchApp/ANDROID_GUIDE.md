# NightWatch Android App - User & Installation Guide

## Overview

NightWatch Android App is a complete mobile application for night watch reporting and management. It provides full functionality for watchers, supervisors, and admins to manage reports, planning, chat, and more.

## Features

### Core Features
- 🔐 **Secure Authentication** - Login with email and password
- 📊 **Dashboard** - Overview of reports, statistics, and quick actions
- 📝 **Report Management** - Create, view, edit, and validate reports
- 🚨 **Event Tracking** - Add incidents and observations with severity levels
- 📷 **Photo Management** - Upload photos via camera or gallery
- 📅 **Planning** - View work schedule and manage shifts
- 📜 **History** - Search and filter report history
- 💬 **Real-time Chat** - Message team members instantly
- ⚙️ **Admin Panel** - Manage users, sites, clients, and emails
- 📄 **PDF Export** - Download reports as PDF files
- 📧 **Email Reports** - Send reports via email

## Installation

### Option 1: Install APK Directly

1. Download the APK file (`NightWatch.apk`)
2. Enable "Install from Unknown Sources" in your device settings:
   - Go to Settings > Security > Unknown Sources
   - Enable the option
3. Open the APK file
4. Follow the on-screen instructions to install
5. Open the app from your home screen

### Option 2: Build from Source

#### Prerequisites
- Node.js (v20 or higher)
- Java Development Kit (JDK) 11 or higher
- Android Studio with Android SDK
- Android SDK (API Level 33 or higher)

#### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NightWatchApp
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment**
   - Create `.env` file in root directory
   - Add your API URL:
     ```
     API_URL=http://YOUR_SERVER_IP:3000/api
     SOCKET_URL=http://YOUR_SERVER_IP:3000
     ```

4. **Start the app**
   ```bash
   npm start
   npm run android
   ```

## Getting Started

### First Login

1. Open the NightWatch app
2. Enter your email address
3. Enter your password
4. Tap "Login"

**Default Admin Credentials:**
- Email: `admin@nightwatch.fr`
- Password: `Admin123!`

### Navigation

The app uses a bottom tab navigation for easy access to main features:

- **Dashboard**: Overview and quick actions
- **Reports**: List and manage reports
- **Planning**: View work schedule
- **History**: Search report history
- **Chat**: Team messaging

## Features Guide

### 1. Dashboard

The dashboard provides:
- Welcome message with user name
- Quick statistics (total reports, today's reports, pending, validated)
- Quick action buttons
- Recent reports list

**Actions:**
- Tap "New Report" to create a new report
- Tap any recent report to view details

### 2. Reports

**View Reports:**
- Browse all reports in the list
- Filter by status (All, Validated, Draft)
- Search by site name or watcher name
- Pull down to refresh
- Tap the + button to create new report

**Create Report:**
1. Tap the + button or "New Report"
2. Fill in report information:
   - Site selection
   - Date and time
   - Weather conditions
   - Watcher notes
3. Add events (incidents/observations)
4. Upload photos
5. Tap "Save Draft" or "Validate Report"

**View Report Details:**
- See all report information
- View events and photos
- Download PDF
- Send via email
- Share report

### 3. Planning

**View Schedule:**
- Browse monthly planning
- Navigate between months using arrows
- View shift details (site, watcher, time)
- See shift status (Scheduled/Completed)

**Actions:**
- Export planning as iCal
- Import from RH system

### 4. History

**Search Reports:**
- Filter by status (All, Validated, Draft)
- View reports sorted by date
- See report count
- Tap any report to view details

### 5. Chat

**Conversations:**
- View all conversations
- See unread message count
- See last message preview
- Tap to open conversation

**Send Messages:**
1. Tap on a conversation or create new one
2. Type your message
3. Tap the send button
4. Real-time delivery
- See read receipts (✓)

### 6. Admin Panel (Admins Only)

Access via Profile > Admin or navigate directly to Admin screen.

**Overview Tab:**
- View system statistics
- See recent activity

**Users Tab:**
- View all users
- Manage user accounts

**Sites Tab:**
- View all sites
- Manage site information

**Clients Tab:**
- View all clients
- Manage client information

**Emails Tab:**
- View email recipients
- Add/remove recipients

### 7. Profile

**View Profile:**
- See personal information
- View role and permissions
- Change password

**Change Password:**
1. Tap "Change Password"
2. Enter current password
3. Enter new password
4. Confirm new password
5. Tap "Update Password"

**Actions:**
- Refresh profile
- Logout

## User Roles

### Admin
- Full access to all features
- Manage users, sites, clients
- View statistics
- Validate reports

### Supervisor
- View and manage reports
- Validate reports
- View planning
- Chat with team

### Watcher
- Create and edit own reports
- View own reports
- View planning
- Chat with team

## Tips & Best Practices

### Creating Reports
- Always fill in required fields
- Add detailed notes for clarity
- Upload photos for documentation
- Validate reports when complete

### Using Planning
- Check planning regularly
- Note shift times and locations
- Report any scheduling conflicts

### Chat
- Use chat for quick communication
- Keep messages professional
- Check for unread messages

### Security
- Keep your password secure
- Logout when not using the app
- Don't share credentials
- Report suspicious activity

## Troubleshooting

### App Won't Install
- Enable "Unknown Sources" in settings
- Check available storage
- Ensure Android version compatibility (Android 7.0+)

### Login Issues
- Verify email and password
- Check internet connection
- Ensure server is running
- Contact admin if credentials lost

### Can't Connect to Server
- Check internet connection
- Verify server URL in settings
- Ensure backend is running
- Try VPN if on corporate network

### Photos Not Uploading
- Check camera permissions
- Ensure sufficient storage
- Check file size limits
- Try using gallery instead of camera

### Chat Not Working
- Check internet connection
- Ensure Socket.io server is running
- Refresh the app
- Check for app updates

### App Crashes
- Restart the app
- Clear app cache
- Update to latest version
- Reinstall if problem persists

### Push Notifications Not Working
- Enable notifications in app settings
- Check device notification settings
- Ensure background app refresh is enabled

## Performance Tips

- Keep app updated
- Clear cache regularly
- Close unused apps
- Use Wi-Fi for large uploads
- Manage storage space

## Support

For technical support:
- Check this guide first
- Review the online documentation
- Contact your system administrator
- Submit a support ticket

## Privacy & Security

- All data is encrypted
- Secure authentication (JWT)
- No data shared with third parties
- GDPR compliant
- Regular security updates

## Updates

The app will notify you when updates are available. Always keep the app updated for:
- New features
- Bug fixes
- Security patches
- Performance improvements

## FAQ

**Q: Can I use the app offline?**
A: Currently, the app requires an internet connection. Offline mode is planned for future updates.

**Q: How do I reset my password?**
A: Contact your administrator to reset your password.

**Q: Can I access the app on multiple devices?**
A: Yes, you can log in on multiple devices.

**Q: Is my data secure?**
A: Yes, all data is encrypted and transmitted securely.

**Q: How do I report a bug?**
A: Contact your administrator or submit a support ticket.

**Q: Can I customize the app?**
A: Some customization options are available in settings.

## Version History

### Version 1.0.0
- Initial release
- Core features implemented
- Authentication and authorization
- Report management
- Planning and history
- Real-time chat
- Admin panel
- PDF and email export

---

© 2024 NightWatch. All rights reserved.