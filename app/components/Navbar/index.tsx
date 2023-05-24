import styles from "./navbar.module.css";
import { Link } from "@remix-run/react";
import Button from "../Button";

const Navbar = (props: NavbarProps) => {
    return (
        <nav className={styles.navbar}>
            <Link className={styles.link} to="/">
                <section className={styles.section}>
                    <img src="/Icon.svg" width={36} height={36} alt="Logo" />
                    <span className={styles.name}>Astraflow</span>
                </section>
            </Link>
            <section
                className={`${styles.section} ${styles.buttons}`}
                style={props.hideButtons ? { display: "none" } : {}}
            >
                {props.children || (
                    <>
                        <Link className={styles.link} to="/login">
                            Log in
                        </Link>
                        <Link className={styles.link} to="/signup">
                            <Button>Sign up</Button>
                        </Link>
                    </>
                )}
            </section>
        </nav>
    );
};

interface NavbarProps {
    hideButtons?: boolean;
    children?: React.ReactNode;
}

export default Navbar;
