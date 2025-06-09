// src/components/theme-provider.tsx
"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Định nghĩa các loại theme có thể có
type Theme = "dark" | "light" | "system"

// Định nghĩa kiểu cho props của ThemeProvider
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Định nghĩa kiểu cho trạng thái của context
type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Giá trị khởi tạo cho context, với cảnh báo nếu setTheme được gọi sai ngữ cảnh
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => console.warn("setTheme được gọi bên ngoài ThemeProvider"),
}

// Tạo React Context
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Component ThemeProvider chính
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    // Khi tải lần đầu, lấy theme từ localStorage hoặc dùng giá trị mặc định
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    // Xử lý khi theme là "system"
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }
    
    // Thêm class 'dark' hoặc 'light' vào thẻ <html>
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Lưu theme mới vào localStorage và cập nhật state
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Custom hook để sử dụng theme context một cách dễ dàng
// Lỗi ESLint "react-refresh/only-export-components" xảy ra vì tệp này
// export cả một React component (ThemeProvider) và một hook không phải component (useTheme).
// Mặc dù việc chuyển hook sang một tệp riêng sẽ làm hài lòng linter,
// pattern đặt provider và hook của nó cùng nhau rất phổ biến và an toàn.
// Vô hiệu hóa quy tắc cho dòng export này là một giải pháp thực tế và được chấp nhận rộng rãi.
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme phải được sử dụng bên trong một ThemeProvider")
  }

  return context
}
