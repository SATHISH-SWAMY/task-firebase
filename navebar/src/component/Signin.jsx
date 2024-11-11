import { Button } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from './FireBase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';


function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            toast.error(`Passwords do not match`)
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            console.log("User Registered Successfully!", user);
            toast.success("User Registered Successfully!")
            if (user) {
                await setDoc(doc(db, "user", user.uid), {
                    email: user.email,
                    password: password
                    
                })
                window.location.href = "/login"
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message)
        }
    };

    return (
        <div
    style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f7f8fa"
    }}
>
    <Toaster position="top-center" reverseOrder={false} />
    <form
        onSubmit={handleSignup}
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
        <h1 style={{ color: "#333", marginBottom: "20px" }}>Sign Up</h1>

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
            <input
                type="password"
                placeholder="Confirm Password"
                style={{
                    padding: '12px',
                    borderRadius: '5px',
                    border: "1px solid #ddd",
                    outline: "none",
                    width: "100%",
                }}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                    width: "100%",
                    fontWeight: "bold"
                }}
            >
                Sign Up
            </Button>
            <Link
                to="/login"
                style={{
                    color: "#4CAF50",
                    textDecoration: "none",
                    textAlign: "center",
                    fontSize: "14px",
                    marginTop: "10px"
                }}
            >
                Already have an account? Go to Login Page
            </Link>
        </div>
    </form>
</div>

    );
}

export default Signin;
