import './Input.css'

interface InputProp{
    label:string,
    type:string,
    valueRef : React.RefObject<string>,
    className:string,
    id:string
}

function Input(props:InputProp){
    const {label, type, valueRef, className, id} = props;
    return  <div className={"jinput " + className}>
                <h6>{label}</h6>
                <input id={id} className="w-100" type={type} onChange={(e)=>{ valueRef.current = e.target.value}}/>
            </div>
}

export default Input;