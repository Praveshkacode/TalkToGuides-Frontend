import { createContext } from "react";
import { psychicExperts } from "../assets/assets";
import { reviewData } from "../assets/assets";
export const AppContext = createContext()

const AppContextProvider = (props)=>{

    const currencySymbol = "$"
    const value = {
        psychicExperts,currencySymbol,reviewData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider