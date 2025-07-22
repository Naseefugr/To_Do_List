const firebaseConfig = {
  apiKey: "AIzaSyB-NDt66meKVVAZBCl-Ju2O9rL_RsI4owQ",
  authDomain: "taskmanagerapp-49613.firebaseapp.com",
  databaseURL: "https://taskmanagerapp-49613-default-rtdb.firebaseio.com",
  projectId: "taskmanagerapp-49613",
  storageBucket: "taskmanagerapp-49613.appspot.com",
  messagingSenderId: "238484076070",
  appId: "1:238484076070:web:a22994d9f4910fa499d8e7",
  measurementId: "G-87N4FB59VE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();