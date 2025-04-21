"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import Link from "next/link"
import styles from "../styles/Auth.module.css"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axios.post("/api/auth/signup", { email, password })
      router.push("/")
    } catch (error) {
      alert(error.response?.data?.error || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Create an account</h1>
          <p className={styles.formDescription}>Enter your details to create your account</p>
        </div>

        <form onSubmit={handleSignup} className={styles.form}>
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
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
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
            <p className={styles.passwordHint}>Password must be at least 8 characters long</p>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className={styles.formFooter}>
          <p className={styles.switchText}>
            Already have an account?{" "}
            <Link href="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
