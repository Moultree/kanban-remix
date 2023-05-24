import Button from "../Button";
import Input from "../Input";
import styles from "./style.module.css";
import { useState } from "react";
import { Form } from "@remix-run/react";

const UserSetting = (props: UserSettingProps) => {
    const [value, setValue] = useState<string>("");

    return (
        <div className={styles.setting}>
            <h3>
                <img src={props.img} alt="" />
                {props.heading}
            </h3>
            <Form method="PUT">
                <Input
                    type={props.type}
                    name={props.name}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={props.placeholder}
                ></Input>
                <Button type="submit">Change</Button>
            </Form>
        </div>
    );
};

interface UserSettingProps {
    type: string;
    img: string;
    heading: string;
    name: string;
    placeholder: string;
}

export default UserSetting;
