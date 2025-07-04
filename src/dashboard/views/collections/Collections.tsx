import Select from '../../../widgets/Select';
import './Collections.css'
import MemberCollectionStatus, { type MemberCollectionProp } from './MemberCollectionStatus';
import RecordCollection from './RecordCollection';



function Collections(){
    let sampleCollectionNames = [
        'Membership Fee',
        'Karajan Collection',
        'Pastoral Day Collection',
        'Collection 1',
        'Collection 1',
        'Collection 1',
        'Collection 1',
    ]

    let memberStatus : MemberCollectionProp[] = [];

    for(let i = 0; i < 100; i++){
        memberStatus.push({
            name: 'Gamat, Ethan Van Q. ' + i,
            darken : i % 2 === 0,
            collection_status: sampleCollectionNames.map((item)=> (Math.floor(Math.random() * 1000) % 3 === 2) ? true : false)
        
        });
    }

    console.log(memberStatus);

    const collectionNames = () => {
        return sampleCollectionNames.map((item)=>{
    
            return <th  style={{minWidth: '200px', textAlign: 'center'}}><h6>{item}</h6></th>
        });
    }

    return (
        <>
            <div className="jgrid">
                <RecordCollection/>

                <div className="jcard" style={{gridColumnStart: 2, gridColumnEnd: 4, gridRowStart: 1, gridRowEnd: 1}}>
                    <div className="jcard-header">
                        <h6>Create New Collection</h6>
                    </div>
                    <div className="jcard-content">

                    </div>
                </div>

                <div className="jcard slider" style={{gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 2, gridRowEnd: 2}}>
                    <table className='jtable w-100 mx-3'>
                        <thead>
                            <tr>
                                <th style={{minWidth: '300px'}}><h6>Name</h6></th>
                                {collectionNames()}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                memberStatus.map( (member) => {
                                    return <MemberCollectionStatus darken={member.darken} name={member.name} collection_status={member.collection_status}/>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            
        </>
    );
}

export default Collections;