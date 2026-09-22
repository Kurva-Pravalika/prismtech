# Firebase FCM setup (optional)

The included UI already demonstrates the alert workflow without external credentials.
For production FCM:

1. Create a Firebase project.
2. Add a Web App.
3. Put the Web App config into `firebase-config.js` using the example file.
4. Add Firebase Messaging to the React app and request notification permission.
5. Register a Firebase messaging service worker.
6. Store device tokens against users in the Spring Boot backend.
7. On an emergency report, the backend sends a high-priority FCM message to users in the warning radius.

The PPT's architecture identifies Firebase FCM for warnings/status alerts and GPS for location awareness.
