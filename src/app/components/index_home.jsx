import React, {Component, PropTypes} from "react"

var Papa = require('./../../papaparse.min.js');
var file = require('file-system');

export default class ApplicationWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileName: '',
      uploadedFile: [],
      results: null
    }

    this.handleFileChange = this.handleFileChange.bind(this)
  }

  showAddVersionModal = () => {
    let {applicationActions} = this.props

    applicationActions.show("application-add-version")
  }

  handleParsedData = (results) => {
    this.setState({fileName: '', results})
  }

  handleFileChange = (event) => {
    let {uploadedFile} = this.state
    // parse file
    event.preventDefault()
    var currentFile = event.target.files[0]

    var parsedData = null;

    Papa.parse(currentFile, {
      header: true,
      dynamicTyping: true,
      complete: results => {
        this.handleParsedData(results)
      }
    })
    uploadedFile.push(currentFile)
    this.setState({uploadedFile: uploadedFile, fileName: currentFile.name})
  }

  renderParseData = () => {
    let {results} = this.state

      var totalFee = 0
        var currentDate = null, currentDateFees = 0
        var currentBalance, currentChange, renderDate, renderDateFees, renderBalance, renderChange, amountUnit

        var hasRendered = false

        var el = results.data.map(item => {
          if (item.type == 'fee') {
            totalFee += item.amount
          }

          if (!item.time || !item.type || !item.balance || !item.amount){
            return
          }

          if (currentDate == null) {
            // inital setup
            amountUnit = item['amount/balance unit']
            currentDate = item.time.replace(/T.*/, '')
            currentChange = item.amount
            currentBalance = item.balance

            if (item.type == 'fee') {
              currentDateFees = item.amount
            }

          } else if (currentDate == item.time.replace(/T.*/, '')) {
            // same date
            currentChange += item.amount
            currentBalance = item.balance

            if (item.type == 'fee') {
              currentDateFees += item.amount
            }

          } else {
            // same new date
            renderDate = currentDate
            renderChange = currentChange
            renderBalance = currentBalance
            renderDateFees = currentDateFees

            currentDate = item.time.replace(/T.*/, '')
            currentChange = item.amount
            currentBalance = item.balance

            if (item.type == 'fee') {
              currentDateFees = item.amount
            }

            return this.handleRenderRow(renderDate, renderBalance, renderChange, renderDateFees)
          }
        })

        return <div>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th className="sort-header">Date</th>
                <th className="sort-header">Change</th>
                <th className="sort-header">Fees</th>
                <th className="sort-header">Balance</th>
              </tr>
            </thead>
            <tbody>

              {el}
              { this.handleRenderRow(currentDate, currentBalance, currentChange, currentDateFees) }

            </tbody>
          </table>
          <div>Unit: {amountUnit}</div>
          { amountUnit == "USD" ? <div>Total Fees: {totalFee}</div> : null }
        </div>

      }

      handleRenderRow(date, balance, change, fees){

        return (
          <tr>
            <td>
              {date}
            </td>
            <td>
              { Math.round((change - fees) * 100) / 100 }
            </td>
            <td>
              { Math.round(fees * 100) / 100 }
            </td>
            <td>
              { Math.round(balance * 100) / 100}
            </td>
          </tr>
        )
      }

      render() {
        let {fileName, uploadedFile, results} = this.state

        return (
          <div>
            <div className="col-md-4 toolbar">

              <div>
                <div className="btn btn-default btn-file">
                  <label className="btn btn-success btn-file">
                    Browse
                    <input ref="file" type="file" className="upload-license-file" onChange={this.handleFileChange} style={{
                      'display': 'none'
                    }} disabled={false}/>
                  </label>
                  <div ref='fileName' className='license-file-name'>{fileName || 'No file choosen'}</div>
                </div>
              </div>

              <div>
                <div>
                  Uploaded Files
                </div>
                {uploadedFile && uploadedFile.map(file => {
                  return <div>{file.name}</div>
                })}
              </div>

              <div className="col-md-12">
                <button className='btn btn-primary'>
                  Export
                </button>
              </div>
            </div>

            <div className="col-md-8">
              {!results
                ? <div>Consolidate your csv files into one documentation.
                  </div>
                : this.renderParseData()
}
            </div>
          </div>
        )
      }

    }

    ApplicationWrapper.propTypes = {}
