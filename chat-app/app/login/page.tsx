"use client"; // This is a client component 👈🏽

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (event) => {
        event.preventDefault();  // Prevent default form submission behavior
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                const response2 = await fetch('http://localhost:8000/users/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + data.access_token
                    },
                });
                if (response.ok) {
                    const data = await response2.json();
                    localStorage.setItem('full_name', data.full_name);
                    router.push('/');
                } else {
                    alert('Failed!');
                }
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.card}>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Username"
                        className={styles.formInput}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className={styles.formInput}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className={styles.formButton} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
