import { useEffect, useRef, useState } from 'react';
import Input from './Input';
import './SearchBar.css'

interface SearchBarProp{
    label : string,
    type : string,
    valueRef : React.RefObject<string>,
    className : string,
    id : string,
    array : any[]
}

function SearchBar(props : SearchBarProp){
    const {label, type, valueRef, className, id, array} = props;

    const [matches, setMatches] = useState<string[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const resultRef = useRef<HTMLDivElement>(null);

    const onChange = (input : HTMLInputElement) => {
        const searchValue = input.value; // get the input text
        valueRef.current = searchValue; //set valueRef value to the search value

        if(searchValue.length <= 0){
            setShowResults(false);
            setMatches([]); 
            return;
        }

        const valueRegex = new RegExp(searchValue, 'i'); // 'i' for case-insensitive matching

        const matches = array.filter((e) => valueRegex.test(e));
        setShowResults(true);
        setMatches(matches);
    }

    const setValueTo = (value : string) => {
        let inpElement = (document.getElementById(id) as HTMLInputElement);
        inpElement.value = value;
        onChange(inpElement);
    }

    useEffect( ()=>{
        const handleClick = (e : MouseEvent) => {
            //handle
            // if(resultRef.current && !resultRef.current.contains(e.target as Node)){
                
            // }

            setShowResults(false);
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <>
            <div className="">
                <Input isAutoComplete={false} label={label} type={type} valueRef={valueRef} className={className} id={id} onChange={(e : HTMLInputElement)=>onChange(e)}/>
                <div className="search-container">
                    <div ref={resultRef} className="results" style={{
                                                    backgroundColor: '#FFF',
                                                    position: 'absolute',
                                                    top: 'auto', // directly below the input
                                                    left: 'auto',
                                                    width: '',
                                                    zIndex: 1000, // ensure it shows on top
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                                    borderRadius: '4px',
                                                    padding: '0.5rem',
                                                    display: (showResults ? 'block' : 'none')
                                                }}>

                        {matches.map((match) => {
                            return <p className='search-bar-item' onClick={()=>{setValueTo(match)}}>{match}</p>
                        })}

                        {matches.length <= 0 ? <p>No results found...</p> : <></>}
                    </div>
                </div>
            </div>
            
        </>
    );
}

export default SearchBar;