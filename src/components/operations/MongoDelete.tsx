import React, {useState} from "react";
import {baseURI} from "../../App";
import {JsonInput} from "../JsonInput";

type Props = {
    collection?: string | null;
    setResultMessage: (message: string) => void;
}

export function MongoDelete (props: Props) {
    const [jsonInput, setJsonInput] = useState<JSON | null>(null);
    const handleJsonInputChange = (json: JSON) => setJsonInput(json);

    const handleDeletion = () =>
        fetch(encodeURI(`${baseURI}/delete/${props.collection}/${JSON.stringify(jsonInput ?? {})}`))
            .then(message => message.text()).then(message => props.setResultMessage(message));

    return <div>
        <button onClick={handleDeletion}>Delete</button>
        <hr />
        <JsonInput onChange={handleJsonInputChange} />
    </div>
}