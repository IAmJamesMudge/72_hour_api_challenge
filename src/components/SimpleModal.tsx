import styled from "styled-components"

const DefaultModalStyled = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;

    background-color: rgba(0,0,0,0.25);
    z-index: 100;
    
    .content {
        display: inline-block;
        position: absolute;
        left: 50%;
        top: min(5vh,100px);
        transform: translate(-50%,0);
        max-height: 80vh;
        height: 80vh;
        width: 85vw;
        padding: 12px 24px;

        background-color: rgba(250,250,250,1);
        border-radius: 6px;
        border: 2px solid rgba(255,255,255,1);

        overflow-y: auto;
    }

`;

type props = {
    children:React.ReactNode;
    open:boolean;
    onCancel:() => void;
}
export default function SimpleModal(props:props) {


    return (
        <DefaultModalStyled onClick={props.onCancel} style={{display: props.open ? "block" : "none"}}>
            <div onClick={(e) => {e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation();}} className="content">
                {props.children}
            </div>

        </DefaultModalStyled>
    )
}