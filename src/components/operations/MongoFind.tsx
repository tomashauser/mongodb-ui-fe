import {WithLabel} from "../WithLabel";
import {JsonInput} from "../JsonInput";
import React, {useRef, useState} from "react";
import {baseURI, StyledFormRow} from "../../App";

type Props = {
    collection?: string | null;
    setQueryResult: (json: JSON) => void;
}

export function MongoFind (props: Props) {
    const [jsonInput, setJsonInput] = useState<JSON | null>(null);
    const handleJsonInputChange = (json: JSON) => setJsonInput(json);

    const handleFinding = () => {
        fetch(encodeURI(`${baseURI}/find/${props.collection}/${JSON.stringify(jsonInput ?? {})}`))
            .then(response => response.json())
            .then(data => props.setQueryResult(data));
    }

    return <div>
            <button onClick={handleFinding}>Find</button>
        <hr />
        <JsonInput allowLogicalConditions={true} onChange={handleJsonInputChange}/>
    </div>
}