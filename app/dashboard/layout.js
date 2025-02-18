import Navbar from "@/components/Navbar";


export const metadata = {
    title: "DLW Admin",
    description: "Dashboard.",
};

export default function RootLayout({ children }) {
    return (

        <html lang="en">
            <body
                className='flex items-center antialiased flex-row'
            >
                <Navbar />
                {children}
            </body>
        </html>

    );
}
