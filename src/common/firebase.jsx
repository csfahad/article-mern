import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxqKhFLUHb4jnM5-BvEVHNgfTrOH1EQ-A",
  authDomain: "medium-mern.firebaseapp.com",
  projectId: "medium-mern",
  storageBucket: "medium-mern.appspot.com",
  messagingSenderId: "68336988557",
  appId: "1:68336988557:web:c4659f7cc2c6419e960dc4",
};

const app = initializeApp(firebaseConfig);

// google auth
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
    return user;
  } catch (err) {
    console.log(err);
  }
};
