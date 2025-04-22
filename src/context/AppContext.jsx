import { createContext } from "react";
import { psychicExperts } from "../assets/assets";

export const AppContext = createContext()

const AppContextProvider = (props)=>{

    const value = {
        psychicExperts
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider