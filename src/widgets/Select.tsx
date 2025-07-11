import './Select.css'

interface SelectProp{
    label : string,
    choices : (string[] | undefined),
    valueRef? : React.RefObject<string>
    selectRef? : React.Ref<HTMLSelectElement>
    id? : string
}

function Select(props:SelectProp){
    const {label, choices, valueRef, selectRef, id} = props;

    if(!choices){
        return (
            <div className="jselect">
                <h6>{label}</h6>
                <select name="label">
                    <option value="">No Data Available!</option>
                </select>
            </div>
        );
    }

    return (
        <div className="jselect">
            <h6>{label}</h6>
            <select id={id} name="label" ref={selectRef} onChange={(e)=>{ if(!!valueRef) {valueRef!.current = e.target.options[e.target.selectedIndex].value;} console.log('value change: ' + e.target.options[e.target.selectedIndex].value)}}>
                {choices!.map( (item)=>{
                    return <option value={item}>{item}</option>
                })}
            </select>
        </div>
    );
}

export default Select;