import "./globals.css";
import Footer from "./components/Footer";

export const metadata = {
  title: "Investomania - ABC XIII",
  description: "The Website for Investomania - ABC XIII",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{ backgroundColor: "#191919" }}
      >
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
