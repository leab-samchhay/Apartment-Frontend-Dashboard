import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import React, { useState } from "react";
import { toast } from "react-toastify";
import type { AuthLogin } from "../model/AuthLogin.tsx";
import { AuthService } from "../services/AuthService";

import { FaUser, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";

export const LoginPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState<AuthLogin>({
        username: "",
        password: "",
    });

    // Parse JWT Token
    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

            const jsonPayload = decodeURIComponent(
                window
                    .atob(base64)
                    .split("")
                    .map(
                        (c) =>
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    )
                    .join("")
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    // Login Function
    const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await AuthService.login(formData);
            const token = response.data.token;

            sessionStorage.setItem("token", token);
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            // Extract role from JWT
            const decodedToken = parseJwt(token);

            if (decodedToken) {
                const role =
                    decodedToken[
                        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    ] ||
                    decodedToken["role"] ||
                    decodedToken["roles"];

                if (role) {
                    sessionStorage.setItem(
                        "role",
                        typeof role === "string" ? role : JSON.stringify(role)
                    );
                }
            } else if (response.data.roles && response.data.roles.length > 0) {
                const roleNames = response.data.roles.map((r: any) => r.name);
                sessionStorage.setItem("role", JSON.stringify(roleNames));
            }

            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                /* Lock the page to the viewport so it never scrolls */
                html, body, #root {
                    height: 100%;
                    margin: 0;
                    overflow: hidden;
                }

                .login-page,
                .login-page * {
                    box-sizing: border-box;
                }

                .login-page {
                    height: 100vh;
                    height: 100dvh;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: clamp(12px, 3vh, 32px);
                    background: #f5f5fa;
                    position: relative;
                    overflow: hidden;
                    font-family: Arial, sans-serif;
                }

                /* Background decoration */
                .login-page::before {
                    content: "";
                    position: absolute;
                    width: 450px;
                    height: 450px;
                    background: #e9e6f7;
                    border-radius: 45%;
                    top: -180px;
                    left: -100px;
                    transform: rotate(-20deg);
                }

                .login-page::after {
                    content: "";
                    position: absolute;
                    width: 800px;
                    height: 250px;
                    background: #eeedf8;
                    bottom: -130px;
                    left: -100px;
                    transform: rotate(-15deg);
                }

                /* Main Container: fills available height, capped at 700px */
                .login-container {
                    width: 100%;
                    max-width: 1100px;
                    height: 100%;
                    max-height: 700px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    background: #ffffff;
                    border-radius: 26px;
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 25px 70px rgba(40, 35, 80, 0.12);
                }

                /* Left Panel */
                .login-left {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    padding: 32px;
                    background: linear-gradient(
                        145deg,
                        #632d83 0%,
                        #842b91 45%,
                        #c01983 100%
                    );
                }

                .login-left::before {
                    content: "";
                    position: absolute;
                    width: 650px;
                    height: 180px;
                    background: rgba(255, 255, 255, 0.08);
                    transform: rotate(-18deg);
                    top: 110px;
                    left: -150px;
                    border-radius: 100px;
                }

                .login-left::after {
                    content: "";
                    position: absolute;
                    width: 650px;
                    height: 180px;
                    background: rgba(255, 255, 255, 0.07);
                    transform: rotate(-18deg);
                    bottom: 100px;
                    left: -100px;
                    border-radius: 100px;
                }

                .login-brand {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    color: white;
                }

                .login-brand-icon {
                    width: clamp(64px, 12vh, 100px);
                    height: clamp(64px, 12vh, 100px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0 auto clamp(18px, 4vh, 35px);
                    border-radius: 30px;
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    font-size: clamp(32px, 6.5vh, 55px);
                    font-weight: bold;
                    transform: rotate(-10deg);
                }

                .login-brand-icon span {
                    display: flex;
                    transform: rotate(10deg);
                }

                .login-brand-title {
                    font-size: clamp(26px, 4.5vh, 38px);
                    font-weight: 700;
                    letter-spacing: 5px;
                    margin: 0;
                    color: white;
                }

                .login-brand-subtitle {
                    margin: 16px 0 0;
                    font-size: 14px;
                    letter-spacing: 3px;
                    color: rgba(255, 255, 255, 0.75);
                }

                /* Right Panel */
                .login-right {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: clamp(24px, 5vh, 56px) clamp(24px, 5vw, 64px);
                    background: #ffffff;
                    min-height: 0;
                }

                .login-form-wrapper {
                    width: 100%;
                    max-width: 440px;
                }

                .login-heading {
                    font-size: clamp(26px, 4.4vh, 34px);
                    font-weight: 700;
                    color: #292d4b;
                    margin: 0 0 8px;
                    letter-spacing: -1px;
                }

                .login-description {
                    font-size: 14px;
                    color: #77788b;
                    margin: 0 0 clamp(18px, 4vh, 36px);
                }

                .login-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #292d4b;
                    margin-bottom: clamp(6px, 1.2vh, 12px);
                }

                /* Input */
                .login-input-wrapper {
                    position: relative;
                    margin-bottom: clamp(14px, 3vh, 26px);
                }

                .login-input {
                    width: 100%;
                    height: clamp(44px, 6.5vh, 52px);
                    padding: 0 48px 0 25px;
                    border: 1px solid transparent;
                    border-radius: 30px;
                    background: #f6f5fa;
                    color: #292d4b;
                    font-size: 14px;
                    box-shadow: none;
                }

                .login-input::placeholder {
                    color: #a5a5b2;
                }

                .login-input:focus {
                    background: #ffffff;
                    border-color: #a02b91;
                    box-shadow: 0 0 0 4px rgba(160, 43, 145, 0.08);
                }

                .login-input-icon {
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #8c8ca0;
                    z-index: 2;
                    font-size: 17px;
                    pointer-events: none;
                }

                .login-eye-button {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: none;
                    background: transparent;
                    color: #8c8ca0;
                    cursor: pointer;
                    z-index: 3;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .login-eye-button:hover {
                    color: #a02b91;
                }

                /* Forgot Password */
                .login-forgot {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: -8px;
                    margin-bottom: clamp(18px, 4vh, 36px);
                }

                .login-forgot button {
                    border: none;
                    background: transparent;
                    color: #66677c;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 0;
                }

                .login-forgot button:hover {
                    color: #a02b91;
                }

                /* Button */
                .login-submit {
                    width: 100%;
                    height: clamp(44px, 6.5vh, 52px);
                    border: none;
                    border-radius: 30px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    background: linear-gradient(100deg, #c01983, #a01e91);
                    box-shadow: 0 10px 25px rgba(192, 25, 131, 0.2);
                    transition: all 0.3s ease;
                }

                .login-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    color: white;
                    background: linear-gradient(100deg, #a01e91, #821b85);
                    box-shadow: 0 15px 30px rgba(192, 25, 131, 0.3);
                }

                .login-submit:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                /* Register */
                .login-register {
                    text-align: center;
                    margin-top: clamp(16px, 3vh, 30px);
                    font-size: 14px;
                    color: #292d4b;
                }

                .login-register button {
                    border: none;
                    background: transparent;
                    color: #a01e91;
                    text-decoration: underline;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 5px;
                }

                .login-register button:hover {
                    color: #751b7d;
                }

                /* Tablet / mobile: stack, brand becomes a slim banner */
                @media (max-width: 900px) {
                    .login-container {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                        max-width: 500px;
                    }

                    .login-left {
                        padding: 20px;
                    }

                    .login-brand {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        text-align: left;
                    }

                    .login-brand-icon {
                        width: 52px;
                        height: 52px;
                        font-size: 24px;
                        margin: 0;
                        border-radius: 16px;
                        flex-shrink: 0;
                    }

                    .login-brand-title {
                        font-size: 22px;
                        letter-spacing: 3px;
                    }

                    .login-brand-subtitle {
                        font-size: 10px;
                        margin-top: 4px;
                        letter-spacing: 2px;
                    }
                }

                @media (max-width: 480px) {
                    .login-page {
                        padding: 10px;
                    }

                    .login-container {
                        border-radius: 20px;
                    }

                    .login-right {
                        padding: 22px;
                    }
                }

                /* Very short screens: drop the banner so the form always fits */
                @media (max-height: 640px) and (max-width: 900px) {
                    .login-left {
                        display: none;
                    }

                    .login-container {
                        grid-template-rows: 1fr;
                    }
                }
            `}</style>

            <div className="login-page">
                <div className="login-container">
                    {/* LEFT PANEL */}
                    <div className="login-left">
                        <div className="login-brand">
                            <div className="login-brand-icon">
                                <span>
                                    <FaArrowRight />
                                </span>
                            </div>

                            <div>
                                <h1 className="login-brand-title">APARTMENT</h1>
                                <p className="login-brand-subtitle">
                                    YOUR ACCOUNT. YOUR ACCESS.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="login-right">
                        <div className="login-form-wrapper">
                            <h2 className="login-heading">Login Dashboard</h2>

                            <p className="login-description">
                                Sign in if you have an account in here.
                            </p>

                            <Form onSubmit={onLogin}>
                                {/* Username */}
                                <Form.Group>
                                    <Form.Label className="login-label">
                                        Your username
                                    </Form.Label>

                                    <div className="login-input-wrapper">
                                        <Form.Control
                                            className="login-input"
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    username: e.target.value,
                                                })
                                            }
                                            placeholder="Enter your username"
                                            autoComplete="username"
                                            required
                                        />
                                        <FaUser className="login-input-icon" />
                                    </div>
                                </Form.Group>

                                {/* Password */}
                                <Form.Group>
                                    <Form.Label className="login-label">
                                        Password
                                    </Form.Label>

                                    <div className="login-input-wrapper">
                                        <Form.Control
                                            className="login-input"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="login-eye-button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <FaEyeSlash />
                                            ) : (
                                                <FaEye />
                                            )}
                                        </button>
                                    </div>
                                </Form.Group>

                                {/* Forgot Password */}
                                <div className="login-forgot">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toast.info(
                                                "Please contact your administrator to reset your password."
                                            )
                                        }
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Sign In */}
                                <Button
                                    className="login-submit"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "SIGNING IN..." : "SIGN IN"}
                                </Button>
                            </Form>

                            {/* Register */}
                            <div className="login-register">
                                Not a member?
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};