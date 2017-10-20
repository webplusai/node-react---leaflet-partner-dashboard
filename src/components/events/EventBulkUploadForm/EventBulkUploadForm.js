import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import DropzoneComponent from 'react-dropzone-component';
import cl from 'classnames';
import * as XLSX from 'xlsx';
import { renderDate, renderDateTime } from '../../../utils';

import {
    LinkTo,
    renderFileUploadField
} from '../../../helpers';

const make_cols = refstr => Array(XLSX.utils.decode_range(refstr).e.c + 1).fill(0).map((x,i) => ({name:XLSX.utils.encode_col(i), key:i}));

class EventBulkUploadForm extends Component {

    state = {items: [], confirmDialog: 'show'};

    djsConfig = {
        addRemoveLinks: true,
        acceptedFiles: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        autoProcessQueue: false
    };

    componentConfig = {
        iconFiletypes: ['.xlsx'],
        showFiletypeIcon: true,
        postUrl: 'no-url'
    };


    componentDidMount() {

        console.log(this.props);

        const { currentUser } = this.props;


    }

    hideConfirmDialog(){
        this.setState({confirmDialog: 'hide'});
    }

    saveItems(){
            this.props.onSave(this.state.items);
    }


    eventsList(items ) {

        if (items.length > 0) {
            return (
                <table className="table table-bordered table-hover table-striped table-responsive">
                    <thead>
                    <tr>
                        <th>Event Type</th>
                        <th>Dates</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Redemption</th>
                        <th>Created</th>

                    </tr>
                    </thead>
                    <tbody>
                    {items.map(({ event_type, dates, start_time, end_time, location, redemption, cost, special, boost, createdAt }) => (
                        <tr key={event_type + dates[0].name}>
                            <td>
                                {event_type ? event_type.name : null}
                            </td>
                            <td>
                                {dates ? dates[0].name : null}
                            </td>
                            <td>{dates ? dates[0].start : null}</td>
                            <td>{dates ? dates[0].end : null}</td>
                            <td>{redemption.name}</td>
                            <td>{renderDate(createdAt)}</td>

                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }

        return (
            <h2>No items were found in the Excel file</h2>
        );
    }

    confirmationModal(items){

        console.log(items);

        if (items.length > 0){
            return (
                <div className={'modal ' + this.state.confirmDialog} id="myModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title" id="exampleModalLabel">Confirm</h3>
                            </div>
                            <div className="modal-body">
                                {
                                    this.eventsList(items)
                                }
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.hideConfirmDialog.bind(this)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={this.saveItems.bind(this)}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return null;

    }


    onDrop(file) {
        const reader = new FileReader();
        reader.onload = (e) => {

            this.setState({items:[], confirmDialog: 'show'});

            /* Parse data */
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type:'binary'});
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_json(ws, {header:1});
            /* Update state */
            let headers = data[0];
            //TODO: check headers are correct
            console.log(data);

            //TODO: make a table in the confirmation page

            const itemArray = data.slice(1);
            let items = [];
            for(let i=0; i<itemArray.length; i++){
                let item = {};
                const singleItem = itemArray[i];
                item.event_type = singleItem[0];
                item.dates = [{date: singleItem[2], "name": singleItem[1], start: singleItem[3], end: singleItem[4]}];
                item.start_time = singleItem[3];
                item.end_time = singleItem[4];
                item.description = singleItem[5];
                item.redemption = {name: singleItem[6], value: singleItem[6]};
                item.cost = singleItem[7];

                items.push(item);
            }
            this.setState({items});

        };
        reader.readAsBinaryString(file);
    }

    render () {

        const { errorMessage, onSave } = this.props;

        const eventHandlers = {
            addedfile: this.onDrop.bind(this)
        }

        return (

                <form>
                    {this.confirmationModal(this.state.items)}

                    <div className="row">
                        <div className="col-md-8">

                            <div className="col-md-12">
                                <div className="ibox-content text-center"><h2>Please download the Excel template from the link below</h2><br/>
                                        <a className="btn btn-success" href="https://partner.joinleaf.com/misc/excel_template.xlsx">Download Excel Template</a>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <h4>Upload</h4>
                                <fieldset className={cl('form-group', { 'has-error': ( errorMessage) })}>

                                    <DropzoneComponent
                                        config={this.componentConfig}
                                        djsConfig={this.djsConfig}
                                        eventHandlers={eventHandlers}
                                    >
                                        <p>Drop the excel file here, or click to select the file.</p>
                                    </DropzoneComponent>
                                    {((errorMessage && <div className="error help-block">{errorMessage}</div>) )}
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    {errorMessage ? (
                        <div className="alert alert-danger">
                            <strong>Oops!</strong> {errorMessage}
                        </div>
                    ) : null}
                    <div className="btn-group">
                        <LinkTo className="btn btn-default" url="events">Cancel</LinkTo>
                        <button action="submit" className="btn btn-primary">
                            Confirm
                        </button>
                    </div>
                </form>

        );
    }
}


EventBulkUploadForm.defaultProps = {
    items: []
};

EventBulkUploadForm.propTypes = {
    items: PropTypes.array,
    onSave: PropTypes.func.isRequired
};

export default connect(({
                            auth: { currentUser }
                        }) => ({ currentUser }), ({

}))(reduxForm({ form: 'eventbulkupload' })(EventBulkUploadForm));


