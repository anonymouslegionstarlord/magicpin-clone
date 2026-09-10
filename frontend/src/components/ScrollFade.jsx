import { useEffect, useState } from "react";

function ScrollFade() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const updateFade = () => {
            setVisible(window.scrollY > 12);
        };

        updateFade();
        window.addEventListener("scroll", updateFade, {
            passive: true
        });

        return () => {
            window.removeEventListener("scroll", updateFade);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className={`scroll-top-fade ${
                visible ? "scroll-top-fade-visible" : ""
            }`}
        />
    );
}

export default ScrollFade;
