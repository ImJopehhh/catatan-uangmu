window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// helper init, dipanggil di file lain setelah CDN Firebase di-load
window.initFirebase = function() {
  if (!window.firebase.apps?.length) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  }
