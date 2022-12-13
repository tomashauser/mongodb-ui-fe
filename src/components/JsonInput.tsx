import React, {HTMLInputTypeAttribute, useState} from "react";
import ReactJson from "react-json-view";
import styled from "styled-components";
import {WithLabel} from "./WithLabel";
import {normalizeEnumValue, StyledFormRow} from "../App";
import {stringify} from "querystring";

enum InputType {
    'TEXT' = 'TEXT',
    'INTEGER' = 'INTEGER',
    'ARRAY' = 'ARRAY',
    'FLOAT' = 'FLOAT',
    'OBJECT' = 'OBJECT'
}

enum LogicalOperator {
    'NONE' = 'NONE',
    'OR' = 'OR',
    'AND' = 'AND',
}

enum ComparisonOperator {
    'EQ' = 'EQ',
    'LTE' = 'LTE',
    'LT' = 'LT',
    'GT' = 'GT',
    'GTE' = 'GTE',
    'NE' = 'NE',
}

const ComparisonOperatorTranslations: Record<ComparisonOperator, string> = {
    'EQ': '=',
    'LTE': '<=',
    'LT': '<',
    'GT' : '>',
    'GTE' : '>=',
    'NE' : '!=',
}

type Input = {
    id: number;
    name: string;
    value: string;
    type: InputType;
    comparisonOperator: ComparisonOperator;
    conditions?: {
        comparisonOperator: ComparisonOperator;
        type: LogicalOperator;
        value: string;
    }
}

type Props = {
    depth?: number;
    onChange: (json: JSON) => void;
    label?: string;
    allowLogicalConditions?: boolean;
}

export function JsonInput(props: Props) {
    const defaultInput: Input = {id: 0, name: '', value: '', type: InputType.TEXT, comparisonOperator: ComparisonOperator.EQ};
    const [inputs, setInputs] = useState<Input[]>([defaultInput]);

    const convertValue = (type: InputType, input: string) => {
        let value;

        switch (type) {
            case InputType.ARRAY:
                try {
                    value = JSON.parse(input || '[]') as [any];
                } catch (e) {
                    value = JSON.parse('[]') as [any];
                }
                break;
            case InputType.TEXT:
                value = input;
                break;
            case InputType.INTEGER:
                value = Number.parseInt(input);
                break;
            case InputType.FLOAT:
                value = Number.parseFloat(input);
                break;
            case InputType.OBJECT:
                try {
                    value = JSON.parse(input);
                } catch (e) {
                    value = JSON.parse('{}');
                }
                break;
        }

        return value;
    }

    const wrapInComparisonConditionally = (value: unknown, comparisonOperator?: ComparisonOperator) => {
        if (!comparisonOperator || comparisonOperator === ComparisonOperator.EQ) {
            return value;
        }
        const obj: Record<string, unknown> = {};
        const mongoOperatorStr = '$' + comparisonOperator.toLowerCase();
        obj[mongoOperatorStr] = value;
        return obj;
    }

    const getInputsInJson = (inputs: Input[]): JSON => {
        const obj: Record<string, unknown> = {};
        inputs.forEach(input => {
            const value = convertValue(input.type, input.value);
            if (input.conditions && input.conditions?.type != LogicalOperator.NONE) {
                const left: Record<string, unknown> = {};
                const right: Record<string, unknown> = {};
                left[input.name] = wrapInComparisonConditionally(value, input.comparisonOperator);
                right[input.name] = wrapInComparisonConditionally(convertValue(input.type, input.conditions.value), input.conditions.comparisonOperator);
                const opStr = input.conditions.type === LogicalOperator.AND ? '$and' : '$or';
                obj[opStr] = [left, right];
            } else {
                obj[input.name] = wrapInComparisonConditionally(value, input.comparisonOperator);
            }
        });

        return JSON.parse(JSON.stringify(obj));
    }

    const getInputElement = (input: Input) => {
        const updateInputField = (property: keyof Omit<Input, 'id'>, value: string) => {
            setInputs((prev) => {
                const copy = [...prev];
                // @ts-ignore
                copy[copy.indexOf(input)][property] = value;
                props.onChange(getInputsInJson(copy));
                return copy;
            })
        }

        const addLogicalOperator = (operator: LogicalOperator) => {
            setInputs((prev) => {
                const copy = [...prev];
                const cur = copy[copy.indexOf(input)];
                cur.conditions = {
                    type: operator,
                    value: '',
                    comparisonOperator: cur.comparisonOperator ?? ComparisonOperator.EQ
                }
                props.onChange(getInputsInJson(copy));
                return copy;
            })
        }

        const handleConditionUpdate = (text: string) => {
            setInputs((prev) => {
                const copy = [...prev];
                const cur = copy[copy.indexOf(input)];
                if (!cur.conditions) {
                    props.onChange(getInputsInJson(copy));
                    return copy;
                }
                cur.conditions = {
                    type: cur.conditions.type,
                    value: text,
                    comparisonOperator: cur.comparisonOperator ?? ComparisonOperator.EQ
                };
                props.onChange(getInputsInJson(copy));
                return copy;
            })
        }

        const handleComparisonOperatorChange = (newComparisonOperator: ComparisonOperator, inCondition: boolean) => {
            setInputs((prev) => {
                const copy = [...prev];
                const cur = copy[copy.indexOf(input)];
                debugger;
                if (!inCondition) {
                    cur.comparisonOperator = newComparisonOperator;
                    props.onChange(getInputsInJson(copy));
                    return copy;
                }
                if (!cur.conditions) {
                    props.onChange(getInputsInJson(copy));
                    return copy;
                }
                cur.conditions = {
                    type: cur.conditions.type,
                    value: cur.conditions.value,
                    comparisonOperator: newComparisonOperator
                };
                props.onChange(getInputsInJson(copy));
                return copy;
            })
        }

        const getValueComponent = (input: Input | null | undefined) => {
            if (!input) {
                return <></>;
            }

            return (<S.FormRow>
                <S.InputWithComparisonOperatorWrapper>
                    {props.allowLogicalConditions &&
                    <select onChange={event => handleComparisonOperatorChange(event.target.value as ComparisonOperator, false)}>
                        {Object.values(ComparisonOperator).map(co => <option value={co}>{ComparisonOperatorTranslations[co]}</option>)}
                    </select>}
                    <WithLabel label={'Value'}>
                        <input type='text' onChange={event => updateInputField('value', event.target.value)}/>
                    </WithLabel>
                </S.InputWithComparisonOperatorWrapper>
                {props.allowLogicalConditions &&
                    <S.LogicalOperatorWithLabel label='Logical operator'>
                    <select onChange={event => addLogicalOperator(event.target.value as LogicalOperator)}>
                        {Object.values(LogicalOperator).map(type => <option value={type}>{type}</option>)}
                    </select>
                </S.LogicalOperatorWithLabel>}
                {(props.allowLogicalConditions && input.conditions && input.conditions.type != LogicalOperator.NONE) &&
                    <S.InputWithComparisonOperatorWrapper>
                        <select onChange={event => handleComparisonOperatorChange(event.target.value as ComparisonOperator, true)}>
                            {Object.values(ComparisonOperator).map(co => <option value={co}>{ComparisonOperatorTranslations[co]}</option>)}
                        </select>
                        <WithLabel label='2nd condition'>
                            <input type='text' onChange={event => handleConditionUpdate(event.target.value)}/>
                        </WithLabel>
                    </S.InputWithComparisonOperatorWrapper>
                }
            </S.FormRow>)
        }

        return (
            <S.InputRow>
                <WithLabel label='Type'>
                    <select onChange={event => updateInputField('type', event.target.value)}>
                        {Object.values(InputType).map(type => <option value={type}>{normalizeEnumValue(type)}</option>)}
                    </select>
                </WithLabel>
                <WithLabel label={'Property'}>
                    <input type='text' onChange={event => updateInputField('name', event.target.value)}/>
                </WithLabel>
                <div>
                    {getValueComponent(input)}
                </div>
            </S.InputRow>)
    }

    const handleInputAddition = () => setInputs(prev => [...prev, {
        id: prev.length + 1,
        name: '',
        value: '',
        type: InputType.TEXT,
        comparisonOperator: ComparisonOperator.EQ,
    }]);

    const handleInputDeletion = () => setInputs(prev => [...prev.slice(0, prev.length - 1)]);

    const handleEmptying = () => setInputs([defaultInput]);

    return (
        <S.Wrapper>
            <S.Label>
                {props.label ?? 'Data'}
            </S.Label>
            <S.EmptyButton onClick={handleEmptying}>
                Empty
            </S.EmptyButton>
            <S.InputRowsWrapper>
                {inputs.map(input => getInputElement(input))}
                <S.PlusMinusButtonsWrapper>
                    <button onClick={handleInputAddition}>+</button>
                    <button onClick={handleInputDeletion} disabled={inputs.length <= 1}>-</button>
                </S.PlusMinusButtonsWrapper>
            </S.InputRowsWrapper>
            <ReactJson collapsed={false} enableClipboard={false} src={getInputsInJson(inputs)}/>
        </S.Wrapper>
    )
}

const S = {
    Wrapper: styled.div`
      padding: 1.5em;
      background: aliceblue;
      position: relative;
      display: flex;
      flex-direction: column;
      border: 0.5px solid black;
      margin-top: 1em;
    `,
    LogicalOperatorWithLabel: styled(WithLabel)`
      margin: 0 1em;
    `,
    InputWithComparisonOperatorWrapper: styled.div`
      display: flex;
      gap: 0.3em;
      align-items: flex-end;

      input:first-child {
        max-width: 2em;
      }
    `,
    FormRow: styled.div`
      display: flex;
      align-items: flex-start;
    `,
    ConditionsWrapper: styled.div`
      display: flex;
      flex-direction: column;
      gap: 1em;
    `,
    Label: styled.label`
      --offset: 0.25em;
      position: absolute;
      top: 0;
      left: 0;
      font-size: 0.6em;
      border-right: 0.5px solid black;
      border-bottom: 0.5px solid black;
      padding: 0 0.8em;
    `,
    InputRowsWrapper: styled.div`
      margin-bottom: 1em;
    `,
    InputRow: styled.div`
      display: flex;
      gap: 1em;
    `,
    PlusMinusButtonsWrapper: styled.div`
      --offset: 0.5em;
      position: absolute;
      bottom: var(--offset);
      right: var(--offset);
    `,
    EmptyButton: styled.button`
      --offset: 0.5em;
      position: absolute;
      top: var(--offset);
      right: var(--offset);
      width: fit-content;
      height: fit-content;
      font-size: 0.7em;
    `,
}

