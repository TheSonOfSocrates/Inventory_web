import { useContext, useEffect } from "react";
import { authHandler } from "./js_functions";
import { store } from "./store";
import {
  ActionTypes,
  AuthProps,
  GroupProps,
  InventoryProps,
  invoiceType,
  ShopProps,
  UserType,
} from "./types";

export const useAuth = async ({ errorCallBack, successCallBack }) => {
  const { dispatch } = useContext(store);

  useEffect(() => {
    const checkUser = async () => {
      const user = await authHandler();

      // const person:UserType | null = user.filter((item)-> j)
      if (!user) {
        if (errorCallBack) {
          errorCallBack();
        }
        return;
      }
      if (successCallBack) {
        dispatch({ type: ActionTypes.UPDATE_USER_INFO, payload: user });
        successCallBack();
      }
    };
    checkUser();
  }, []);
};

// export const useGetGroups = (
//     setGroup: (data: GroupProps[]) => void,
//     setFetching: (val:boolean) => void) => {

//       useEffect(() => {
//         getGroups(setGroup, setFetching)
//       }, [])
// }

// export const useGetInventories = (
//     setInventory: (data: InventoryProps[]) => void,
//     setFetching: (val:boolean) => void) => {

//       useEffect(() => {
//         getInventories(setInventory, setFetching)
//       }, [])
// }

// export const useGetShops = (
//     setShops: (data: ShopProps[]) => void,
//     setFetching: (val:boolean) => void) => {

//       useEffect(() => {
//         getShops(setShops, setFetching)
//       }, [])
// }

// export const useGetInvoice = (
//   setInvoice: (data: invoiceType[]) => void,
//   setFetching: (val:boolean) => void) => {

//     useEffect(() => {
//       getInvoice(setInvoice, setFetching)
//     }, [])

//   }
