import './Collections.css'
import MemberCollectionStatus, { type MemberCollectionProp } from './MemberCollectionStatus';



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
            <div className="jcard slider">
                <table className='jtable w-100'>
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

            
        </>
    );
}

export default Collections;