"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Link from "next/link"
import styles from "../styles/Auth.module.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axios.post("/api/auth/login", { email, password })
      router.push("/")
    } catch (error) {
      alert(error.response?.data?.error || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Welcome back</h1>
          <p className={styles.formDescription}>Enter your credentials to sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <Link href="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles.formFooter}>
          <p className={styles.switchText}>
            Don't have an account?{" "}
            <Link href="/signup" className={styles.switchLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
