import React, {Component, PropTypes} from "react"

var Papa = require('./../../papaparse.min.js');
var file = require('file-system');


function sortByTime(dataArray){
  return dataArray.sort((a,b)=>{
	   return a.time < b.time ? -1 : a.time > b.time ? 1 : 0;
  })
}

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
    // let { results } = this.state
    // debugger
    //
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

  handleSortingResult( sortedResult ) {

    var transactionBase = {
      // date {
      //   amountUnit: {
      //     balance: null,
      //     change: null,
      //     fees: 0
      //   }
      // }
    }

    var currentDate = null
    var unitType = null

    sortedResult.map(item => {

      // if (item.balance == 3233.6770590468177){
      //   debugger
      // }
      //
      if (!item.time || !item.type || !item.balance || !item.amount){
        return
      }

      // if (item.type == 'fee') {
      //   totalFee += item.amount
      // }

      // if (currentDate != null && currentDate != item.time.replace(/T.*/, '') ){
      if (currentDate != null && transactionBase[item.time.replace(/T.*/, '')] == undefined){
        currentDate = null
        unitType = null
      }

      // create new date
      if (currentDate == null) {
        currentDate = item.time.replace(/T.*/, '')

        unitType = item['amount/balance unit']

        transactionBase[currentDate] = {}
        transactionBase[currentDate][unitType] = {
          balance: item.balance,
        }

        transactionBase[currentDate][unitType]['change'] = ( item.type != 'fee' ) ? item.amount : 0
        transactionBase[currentDate][unitType]['fees'] = ( item.type == 'fee' ) ? item.amount : 0

      } else if ( currentDate == item.time.replace(/T.*/, '') ) {

        // add to balance
        var currentDateUnit = transactionBase[currentDate][item['amount/balance unit']]

        if (currentDateUnit){

          if (item.type == 'fee') {
            currentDateUnit['fees'] += item.amount
          } else {
            currentDateUnit['change'] += item.amount
          }

          currentDateUnit['balance'] = item.balance

        } else {
          // different unit
         currentDateUnit = {
           balance: item.balance
          }

          currentDateUnit['change'] = ( item.type != 'fee' ) ? item.amount : 0
          currentDateUnit['fees'] = ( item.type == 'fee' ) ? item.amount : 0
        }

      }
    })

    return transactionBase
  }

  renderParseData = () => {
    let {results} = this.state

      var totalFee = 0
      var currentDate = null, currentDateFees = 0, hasConverted = false
      var currentBalance, currentChange, renderDate, renderDateFees, renderBalance, renderChange, amountUnit, convertedBalance, convertedChange, convertedUnit

      var sortedOranizedData = this.handleSortingResult( sortByTime(results.data) )

      var el = Object.keys(sortedOranizedData).map( dateTime => {
        var units = Object.keys( sortedOranizedData[dateTime] )

        // var unitTypes = dateTime.keySeq().toArray()
        if (units.length == 1){
          var currentUnit = sortedOranizedData[dateTime][units[0]]

          return (
            <tr>
              <td>
                {dateTime}
              </td>
              <td>
                { Math.round((currentUnit.change - currentUnit.fees) * 100) / 100 }
              </td>
              <td>
                { Math.round(currentUnit.fees * 100) / 100 }
              </td>
              <td>
                { Math.round(currentUnit.balance * 100) / 100}
              </td>
            </tr>
          )

        }
        // }
      })
      // return sortedResult.map(item => {
      //   if (!item.time || !item.type || !item.balance || !item.amount){
      //     return
      //   }
      //
      //   // if (item.type == 'fee') {
      //   //   totalFee += item.amount
      //   // }
      //   //
      //
      //   // inital setup
      //   if (currentDate == null) {
      //     amountUnit = item['amount/balance unit']
      //     currentDate = item.time.replace(/T.*/, '')
      //     currentChange = item.amount
      //     currentBalance = item.balance
      //
      //     if (item.type == 'fee') {
      //       currentDateFees = item.amount
      //     }
      //
      //   } else if (currentDate == item.time.replace(/T.*/, '')) {
      //     // same date
      //     currentChange += item.amount
      //     currentBalance = item.balance
      //
      //     if (item.type == 'fee') {
      //       currentDateFees += item.amount
      //     }
      //
      //     if (amountUnit != item['amount/balance unit'] ) {
      //       convertedUnit = item['amount/balance unit']
      //
      //       if (!convertedBalance || !convertedChange ){
      //
      //       } else {
      //
      //       }
      //
      //     }
      //
      //   } else {
      //     // same new date
      //     renderDate = currentDate
      //     renderChange = currentChange
      //     renderBalance = currentBalance
      //     renderDateFees = currentDateFees
      //
      //     currentDate = item.time.replace(/T.*/, '')
      //     currentChange = item.amount
      //     currentBalance = item.balance
      //
      //     if (item.type == 'fee') {
      //       currentDateFees = item.amount
      //     }
      //
      //     return this.handleRenderRow(renderDate, renderBalance, renderChange, renderDateFees)
      //   }
      // })

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
              {/* { this.handleRenderRow(currentDate, currentBalance, currentChange, currentDateFees) } */}

            </tbody>
          </table>
          {/* <div>Unit: {amountUnit}</div> */}
          {/* { amountUnit == "USD" ? <div>Total Fees: {totalFee}</div> : null } */}
        </div>

      }

      // handleRenderRow(date, balance, change, fees){
      handleRenderRow(dateObject){

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
