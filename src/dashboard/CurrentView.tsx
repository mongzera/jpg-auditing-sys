import './CurrentView.css'

function CurrentView(props : any){
    console.log(props);

    if(props.displayView === undefined) return "Are you trying to hack me?";

    return (
        <div className="current-view">
            <h4 className='weight-600'> <i className='bi bi-arrow-right mx-2'/>{props.displayName}</h4>
            {props.displayView}
        </div>
    )
}

export default CurrentView;