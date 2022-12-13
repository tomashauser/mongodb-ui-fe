import {baseURI} from "../../App";
import {JsonInput} from "../JsonInput";
import {useState} from "react";

type Props = {
    collection?: string | null;
    setResultMessage: (message: string) => void;
}

export function MongoInsert (props: Props) {
    const [jsonInput, setJsonInput] = useState<JSON | null>(null);

    const handleInsertion = () => fetch(
        encodeURI(`${baseURI}/insert/${props.collection}/${JSON.stringify(jsonInput)}`))
        .then(message => message.text()).then(message => props.setResultMessage(message));

    const handleJsonInputChange = (json: JSON) => setJsonInput(json);

    return <div>
        <button onClick={handleInsertion}>
            Insert
        </button>
        <JsonInput onChange={handleJsonInputChange} />
    </div>
}