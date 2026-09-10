import OwnerNavbar from "./OwnerNavbar";

function OwnerLayout({ children }) {
    return (
        <>
            <OwnerNavbar />

            {children}
        </>
    );
}

export default OwnerLayout;