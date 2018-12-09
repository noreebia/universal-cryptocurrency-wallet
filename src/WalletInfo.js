import React, { Component } from 'react';
import CurrencyInfo from "./CurrencyInfo";
import { connect } from 'react-redux';
import SockJsClient from 'react-stomp';
import axios from 'axios';
import { updateBalances, addTransaction } from './actions/actions';
import TransactionDisplay from "./TransactionDisplay";

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.reducer.isLoggedIn,
        username: state.reducer.username,
        balances: state.balanceReducer,
        transactions: state.transactionReducer
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateBalances: (balances) => dispatch(updateBalances(balances)),
        addTransaction: (transactionType, transaction) => dispatch(addTransaction(transactionType, transaction))
    }
}

class WalletInfo extends Component {
    constructor(props) {
        super(props);
        this.receiveDepositNotification = this.receiveDepositNotification.bind(this);
        this.requestWithdrawal = this.requestWithdrawal.bind(this);
    }

    receiveDepositNotification(msg) {
        console.log(msg);
        const { username, transactionHash } = msg;
        if (username == this.props.username) {
            this.props.addTransaction("DEPOSIT", transactionHash);
            axios.get(`/users/${this.props.username}/balances`)
                .then(response => {
                    console.log("adding balance!" + JSON.stringify(response));
                    let { successful, data } = response.data;
                    if (successful) {
                        console.log(data);
                        this.props.updateBalances(data)
                        alert(`You have just received a deposit! You balances have been updated`);
                    }
                })
                .catch(error => alert(error))
        }
    }

    async requestWithdrawal(symbol, destinationAddress, amount) {
        console.log(symbol, destinationAddress, amount);

        let transactionResponse;
        try{
            transactionResponse = await axios.post(`/users/transactions`, { username: this.props.username, currencySymbol: symbol, destinationAddress: destinationAddress.trim(), amount: amount });
        } catch(err){
            alert(`Withdrawal failed! ${err}`);
            return;
        }
        const { successful, data } = transactionResponse.data;
        if (successful) {
            alert(`Successfully withdrew ${symbol}`);
            this.props.addTransaction("WITHDRAWAL", data);
            let balanceQuery;
            try{
                balanceQuery = await axios.get(`/users/${this.props.username}/balances`);
                const { successful, data } = balanceQuery.data;
                if (successful) {
                    this.props.updateBalances(data);
                }
            } catch(err){
                alert(`Withdrawal failed but`)
            }
        } else {
            alert(`Withdrawal failed! ${data}`)
        }

        // axios.post(`/users/transactions`, { username: this.props.username, currencySymbol: symbol, destinationAddress: destinationAddress.trim(), amount: amount })
        //     .then(response => {
        //         const { successful, data } = response.data;
        //         if (successful) {
        //             axios.get(`/users/${this.props.username}/balances`)
        //                 .then(response => {
        //                     let { successful, data } = response.data;
        //                     if (successful) {
        //                         this.props.updateBalances(data)
        //                     }
        //                 })
        //         } else {
        //             alert(`Withdrawal failed! ${data}`)
        //         }
        //     })
        //     .catch()
    }

    render() {
        const listOfCurrencies = this.props.balances.map((balance, index) => <CurrencyInfo key={index} name={balance.currencyName} symbol={balance.currencySymbol} balance={balance.balance} withdraw={this.requestWithdrawal} />)
        return (
            <div>
                {this.props.isLoggedIn && <SockJsClient url='http://localhost:8080/websocket' topics={['/topic/deposits']} onConnect={() => { console.log("connected to server!") }} onMessage={this.receiveDepositNotification}
                    onDisconnect={() => { console.log("disconnected!"); }} ref={(client) => { this.clientRef = client }} />}
                {listOfCurrencies}
                <TransactionDisplay transactions={this.props.transactions} />
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletInfo);
