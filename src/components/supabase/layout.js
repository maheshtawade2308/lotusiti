// app/layout.js
import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext";

export const metadata = { title: "My App" };

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
