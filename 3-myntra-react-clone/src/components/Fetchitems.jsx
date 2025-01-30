import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { itemsActions } from "../store/itemsSlice";
import { fetchStatusActions } from "../store/fetchStatusSlice";

const FetchItems = () => {
  const fetchStatus = useSelector((store) => store.fetchStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fetchStatus?.fetchDone) return; // ✅ Fix: Optional chaining to avoid undefined error

    const controller = new AbortController();
    const signal = controller.signal;

    dispatch(fetchStatusActions.markFetchingStarted());

    fetch("http://localhost:8080/items", { signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch items");
        return res.json();
      })
      .then(({ items }) => {
        dispatch(itemsActions.addInitialItems(items[0])); // ✅ Fix: Ensure API returns correct data
        dispatch(fetchStatusActions.markFetchDone());
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      })
      .finally(() => {
        dispatch(fetchStatusActions.markFetchingFinished());
      });

    return () => {
      controller.abort(); // ✅ Fix: Abort fetch request on unmount
    };
  }, [dispatch, fetchStatus?.fetchDone]); // ✅ Fix: Depend only on `fetchStatus.fetchDone`

  return null; // ✅ Fix: Return `null` instead of an empty fragment
};

export default FetchItems;
