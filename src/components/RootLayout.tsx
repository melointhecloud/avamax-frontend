import { Outlet } from "react-router-dom";
import { AvaChat } from "./chat/AvaChat";

export const RootLayout = () => {
    return (
        <>
            <Outlet />
            <AvaChat />
        </>
    );
};
