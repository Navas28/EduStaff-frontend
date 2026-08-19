import "./globals.css";

export const metadata = {
  title: "EduStaff",
  description: "School Staff Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
