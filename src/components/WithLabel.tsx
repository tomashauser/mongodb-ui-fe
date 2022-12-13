import {ChangeEvent, InputHTMLAttributes, PropsWithChildren, RefObject} from "react";
import styled from "styled-components";

type Props = {
    label: string;
    className?: string;
}

export function WithLabel (props: PropsWithChildren<Props>) {
    return (<S.Wrapper className={props.className}>
        <S.Label>{props.label}</S.Label>
        {props.children}
    </S.Wrapper>)
}

const S = {
    Wrapper: styled.div`
      display: flex;
      flex-direction: column;
    `,
    Label: styled.label`
      font-size: 0.5em;
      color: slategrey;
      align-self: flex-start;
    `,
    Input: styled.input``,
}