import React, {ChangeEvent, useRef, useState} from 'react';
import ReactJson from "react-json-view";
import {JsonInput} from "./components/JsonInput";
import {WithLabel} from "./components/WithLabel";
import styled from "styled-components";
import {MongoFind} from "./components/operations/MongoFind";
import {MongoInsert} from "./components/operations/MongoInsert";
import {MongoUpdate} from "./components/operations/MongoUpdate";
import {MongoDelete} from "./components/operations/MongoDelete";

export const baseURI = 'http://localhost:8080/mongo-api';

enum Option {
    INSERT = 'INSERT',
    FIND = 'FIND',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export function normalizeEnumValue(text: string) {
    return text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);
}

export function App() {
    const [queryResult, setQueryResult] = useState<JSON | null>(null);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<keyof typeof Option>('INSERT');
    const [collection, setCollection] = useState<string | null>(null);

    const updateQueryInputRef = useRef<HTMLInputElement>(null);
    const updateNewDataInputRef = useRef<HTMLInputElement>(null);

    const handleEmptyCollection = () => fetch(
        encodeURI(`${baseURI}/empty/${collection}`))
        .then(message => message.text()).then(message => setResultMessage(message));

    const handleDropCollection = () => fetch(
        encodeURI(`${baseURI}/drop/${collection}`))
        .then(message => message.text()).then(message => setResultMessage(message));

    const handleUpdate = () => fetch(encodeURI(`${baseURI}/update/${collection}/${updateQueryInputRef.current?.value}/${updateNewDataInputRef.current?.value}`))
        .then(message => message.text()).then(message => setResultMessage(message));

    const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOption(e.target.value as keyof typeof Option);

    const handleQueryResultChange = (json: JSON) => setQueryResult(json);
    const handleResultMessageChange = (message: string) => setResultMessage(message);
    const handleCollectionChange = (event: ChangeEvent<HTMLInputElement>) => setCollection(event.target.value);

    return (
        <S.Wrapper>
            <S.OptionsWrapper>
                <WithLabel label='Operation'>
                    <select value={selectedOption} onChange={handleOptionChange}>
                        {Object.values(Option).map(option =>
                            <option value={option}>{normalizeEnumValue(option)}</option>)}
                    </select>
                </WithLabel>
                <hr/>
                <S.FormRow>
                    <WithLabel label='Collection'>
                        <input type='text' onChange={handleCollectionChange} />
                    </WithLabel>
                    <button onClick={handleEmptyCollection}>
                        Empty collection
                    </button>
                    <button onClick={handleDropCollection}>
                        Drop collection
                    </button>
                </S.FormRow>
                {selectedOption === Option.INSERT && <MongoInsert setResultMessage={handleResultMessageChange} collection={collection}/>}
                {selectedOption === Option.FIND && <MongoFind collection={collection} setQueryResult={handleQueryResultChange}/>}
                {selectedOption === Option.UPDATE && <MongoUpdate collection={collection} setResultMessage={handleResultMessageChange} />}
                {selectedOption === Option.DELETE && <MongoDelete collection={collection} setResultMessage={handleResultMessageChange}/>}
                {resultMessage && <S.ResultMessage>{resultMessage}</S.ResultMessage>}
            </S.OptionsWrapper>
            {queryResult && <ReactJson collapsed={false} enableClipboard={false} src={queryResult}/>}
        </S.Wrapper>
    );
}

export const StyledFormRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1em;

  button {
    height: fit-content;
  }
`

const S = {
    Wrapper: styled.main`
      padding: 1em;
    `,
    ResultMessage: styled.div`
      border: 0.5px solid black;
      max-width: 94%;
      font-size: 0.7em;
      text-wrap: normal;
      margin-top: 1em;
    `,
    OptionsWrapper: styled.div`
      background: aliceblue;
      padding: 1em;
      border: 0.5px solid black;
      min-width: 50vw;
    `,
    FormRow: styled.div`
      display: flex;
      align-items: flex-end;
      gap: 1em;

      button {
        height: fit-content;
      }
    `,
}
