import {useState} from "react";
import {baseURI} from "../../App";
import {JsonInput} from "../JsonInput";

type Props = {
    collection?: string | null;
    setResultMessage: (message: string) => void;
}

export function MongoUpdate (props: Props) {
    const [updateQueryJson, setUpdateQueryJson] = useState<JSON | null>(null);
    const [newDataJson, setNewDataJson] = useState<JSON | null>(null);

    const handleUpdate = () => fetch(
        encodeURI(`${baseURI}/update/${props.collection}/${JSON.stringify(updateQueryJson)}/${JSON.stringify({ "$set": newDataJson })}`))
        .then(message => message.text()).then(message => props.setResultMessage(message));

    const handleUpdateQueryJsonChange = (json: JSON) => setUpdateQueryJson(json);
    const handleNewDataJsonChange = (json: JSON) => setNewDataJson(json);

    return <div>
        <button onClick={handleUpdate}>
            Update
        </button>
        <JsonInput label='Data to update' onChange={handleUpdateQueryJsonChange} />
        <JsonInput label='New data' onChange={handleNewDataJsonChange} />
    </div>
}