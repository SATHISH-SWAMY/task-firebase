import { Button } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth/web-extension';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db, provider } from './FireBase';
import toast, { Toaster } from 'react-hot-toast';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';



function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    console.log("email", email);
    console.log("password", password);


    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("user logged in successfully");
            window.location.href = "/allTask"
            toast.success("user logged in successfully");

        } catch (error) {
            console.log(error.message);
            toast.error(error.message);

        }
    }

    const siginWithGoogle = async () => {
        try {
            const details = await signInWithPopup(auth, provider);
            const user = auth.currentUser;
            
            console.log("Google signed in successfully", user);
            console.log("Details:", details);
            
          
    
            if (user) {
                const detail2 = await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL || null,
                    uid: user.uid,
                    phoneNumber: user.phoneNumber || null,
                    lastLogin: new Date().toISOString() // optional: store the login timestamp
                });
                console.log("detail2",detail2);
                
                toast.success("Google signed in successfully");
                window.location.href = "/allTask"
            }
        } catch (error) {
            console.error("Error during Google sign-in:", error.message);
            toast.error(error.message);
        }
    };



    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f0f2f5"
            }}
        >
            <Toaster />
            <form onSubmit={handleLogin}
                style={{
                    width: "400px",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "30px"
                }}
            >
                <h1 style={{ color: "#333", marginBottom: "20px" }}>LOGIN</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: "100%" }}>
                    <input
                        type="email"
                        placeholder="Email"
                        style={{
                            padding: '12px',
                            borderRadius: '5px',
                            border: "1px solid #ddd",
                            outline: "none",
                            width: "100%",
                        }}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        style={{
                            padding: '12px',
                            borderRadius: '5px',
                            border: "1px solid #ddd",
                            outline: "none",
                            width: "100%",
                        }}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            padding: '12px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            border: "none",
                            width: "100%"
                        }}
                    >
                        Sign In
                    </Button>
                    <Link to="/signin"
                        style={{
                            color: "#4CAF50",
                            textDecoration: "none",
                            textAlign: "center",
                            fontSize: "14px",
                            marginTop: "10px"
                        }}
                    >
                        Forgot Password?
                    </Link>
                </div>

                <hr style={{
                    width: '100%',
                    border: '1px solid #ddd',
                    marginTop: "20px",
                    marginBottom: "20px"
                }} />

                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <Button onClick={siginWithGoogle}
                        style={{
                            backgroundColor: "#4285F4",
                            color: "white",
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            border: "none",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <i className="fab fa-google" style={{ marginRight: "8px" }}></i>
                        Sign in with Google
                    </Button>
                </div>
            </form>
        </div>

    );
}

export default Login;
