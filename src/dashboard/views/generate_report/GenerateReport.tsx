import './GenerateReport.css'

function GenerateReport(){
    return (
        <>
            <div className="jgrid ">
                <div className="jcard py-4" style={{gridColumnStart: 1, gridColumnEnd : 4, gridRowStart : 1, gridRowEnd : 1}}>
                    <h6 className="my-0">Core Financial Reports</h6>
                </div>
                <div className="jcard" style={{gridColumnStart: 1, gridColumnEnd : 1, gridRowStart : 2, gridRowEnd : 2}}>
                    <div className="jcard-header py-3">
                        <h6>General Ledger</h6>
                    </div>
                    <div className="jcard-content">
                        <h6>Shows all transactions by account, like expanded T-accounts</h6>
                        <button className="btn btn-danger my-4">Generate</button>
                    </div>
                </div>

                <div className="jcard" style={{gridColumnStart: 2, gridColumnEnd : 2, gridRowStart : 2, gridRowEnd : 2}}>
                    <div className="jcard-header py-3">
                        <h6>Trial Balance</h6>
                    </div>
                    <div className="jcard-content">
                        <h6>Lists all account balances, ensuring debits = credits</h6>
                        <button className="btn btn-danger my-4">Generate</button>
                    </div>
                </div>

                <div className="jcard" style={{gridColumnStart: 3, gridColumnEnd : 3, gridRowStart : 2, gridRowEnd : 2}}>
                    <div className="jcard-header py-3">
                        <h6>T-Chart</h6>
                    </div>
                    <div className="jcard-content">
                        <h6>Generate a historical movement of all accounts</h6>
                        <button className="btn btn-danger my-4">Generate</button>
                    </div>
                </div>

                <div className="jcard py-4" style={{gridColumnStart: 1, gridColumnEnd : 4, gridRowStart : 3, gridRowEnd : 3}}>
                    <h6 className="my-0">COA Compliance Reports</h6>
                </div>
            </div>
        </>
    );
}

export default GenerateReport;

