import './Input.css'

interface InputProp{
    label:string,
    type:string,
    valueRef? : React.RefObject<string>,
    inputRef? : React.Ref<HTMLInputElement>
    className:string,
    id?:string,
    onChange?:Function,
    isAutoComplete? : boolean
}

function Input(props:InputProp){
    const {label, type, valueRef, className, id, onChange, isAutoComplete, inputRef} = props;
    return  <div className={"jinput " + className}>
                <h6>{label}</h6>
                <input ref={inputRef} autoComplete={isAutoComplete ? 'on' : 'off'} id={id} className="w-100" type={type} onChange={(e)=>{ if(!!valueRef?.current){valueRef.current = e.target.value;} if(!!onChange) onChange(e.target);}}/>
            </div>
}

export default Input;