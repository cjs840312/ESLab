import React, { Component } from 'react';
import styles from './App.css'

class App extends Component {

	constructor(props) {
	    super(props);
        this.state = { "login" :true,"signup":false,"account":""};
	}

	toSignup(){
		console.log('click')
		this.setState({ "login":false,"signup": true });
	}

	toLogin(){
		this.setState({"login":true,"signup":false})
	}

	toHome(account){
		this.setState({"login":false,"signup":false,"account":account})
	}

	render() {
		return(
			<div className={styles.App}>
                <h1> Clock </h1>
				{this.state.login? <LoginForm toSignup={this.toSignup.bind(this)} toHome={this.toHome.bind(this)}/>:null}
				{this.state.signup? <SignupForm nextState={this.toLogin.bind(this)} />:null}
				{(this.state.signup || this.state.login) ? null:<UserHome account={this.state.account}/>}
			</div>
		);
	
	};
};

class LoginForm extends Component{
	constructor(props) {
	    super(props);
        this.state = { "account" : "", "password" : ""};
		this.getAccount=this.getAccount.bind(this);
		this.getPassword=this.getPassword.bind(this);
		this.handleLogin=this.handleLogin.bind(this);
		
	}

	getAccount(e){
      this.setState({ "account": e.target.value });
   	}

	getPassword(e){
      this.setState({ "password": e.target.value });
	}

	handleLogin(){
	  fetch('/Login', {
         method: 'POST',
         headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
         },
          body: JSON.stringify({
             "account":this.state.account,
             "password": this.state.password,
         })
      })
	  .then(function(res){return res.json()})
      .then(json=>{
         if(json.state){
			 this.props.toHome(this.state.account);
		 }
		 else{
			 alert("Please check your account and password");
		 }
      })
   	}

	render() {
		return(
			<div className={styles.LoginForm}>
               	<label>Account  : </label> <input type="text"     onChange={ this.getAccount } /> <br/>
				<label>Password : </label> <input type="password" onChange={ this.getPassword }/> <br/>
				<input type ="button" value="Log In" onClick={this.handleLogin} /> 
				<input type ="button" value="Signup" onClick={this.props.toSignup} /> 
			</div>
		);
	
	};
}

class SignupForm extends Component{
	constructor(props) {
	    super(props);
        this.state = { "account" : "", "password" : ""};		
	}

	getAccount(e){
      this.setState({ "account": e.target.value });
   	}

	getPassword(e){
      this.setState({ "password": e.target.value });
	}

	handleSubmit(){
	  fetch('/Signup', {
         method: 'POST',
         headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
         },
          body: JSON.stringify({
             "account":this.state.account,
             "password": this.state.password,
         })
      })
	  .then(function(res){return res.json()})
      .then(json=>{
         if(json.state){
			this.props.nextState();
		 }
		 else{
			 alert("This account has already been used!!\nPleas choose another one ");
		 }
      })
   	}

	render() {
		return(
			<div className={styles.SignupForm}>
				<label>Account  : </label> <input type="text"     onChange={ this.getAccount.bind(this) } /> <br/>
				<label>Password : </label> <input type="password" onChange={ this.getPassword.bind(this) }/> <br/>
				<input type ="button" value="Submit" onClick={this.handleSubmit.bind(this)} /> 
			</div>
		);
	
	};
}

class UserHome extends Component{
	constructor(props) {
	    super(props);
        this.state = {"AddGroup":false,"GroupList":true};		
	}

	createGroup(d){
		fetch('/createGroup', {
         method: 'POST',
         headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
         },
          body: JSON.stringify({
			 "groupName":d.groupName,
             "member": this.props.account+','+d.member,
         })
      })
	  .then(function(res){return res.json()})
      .then(json=>{
         if(json.state){
			this.setState({"AddGroup":false,"GroupList":true});
		 }
		 else{
			 alert('Pleas use another name');
		 }
      })
	}

	toCreate(){
		this.setState({"AddGroup":true,"GroupList":false})
	}


	render() {
		return(
			<div className="UserHome">
				<div>
					{this.state.GroupList?<GroupList create={this.toCreate.bind(this)} account={this.props.account}/>:null}
					{this.state.AddGroup?<AddGroup submit={this.createGroup.bind(this)}/>:null}
				</div>

			</div>
		);
	};
}


class AddGroup extends Component{
	constructor(props) {
	    super(props);
        this.state = {"groupName":"","member":""};		
	}

	handleSubmit(){
		this.props.submit({"groupName":this.state.groupName,"member":this.state.member})
	}

	getName(e){
      this.setState({ "groupName": e.target.value });
   	}

	getMember(e){
      this.setState({ "member": e.target.value });
	}

	render() {
		return(
			<div className="AddGroup">
				<div>
					<label>Group Name  : </label> <input type="text"     onChange={ this.getName.bind(this) } /> <br/>
					<label>Members : </label> <input type="text" onChange={ this.getMember.bind(this) }/> <br/>
					<input type ="button" value="Create" onClick={this.handleSubmit.bind(this)} />
				</div>

			</div>
		);
	};
}

class GroupList extends Component{
	constructor(props) {
	    super(props);
        this.state = {"List":[]};		
	}

	componentDidMount(){
		fetch('/getList', {
         method: 'POST',
         headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
         },
          body: JSON.stringify({
			 "user":this.props.account
         })
      })
	  .then(function(res){return res.json()})
      .then(json=>{
		  console.log(json)
         this.setState({"List":json});
      })
	}

	render() {
		return(
			<div className="GroupList">
				<input type ="button" value="Create Group" onClick={this.props.create} />
				{
					this.state.List.map((g,index)=>(
						<GroupItem key={index} name={g.groupName}  />		
					))
				}
			</div>
		);
	};
}

class GroupItem extends Component{
	constructor(props) {
	    super(props);
        this.state = {"style":{backgroundColor: 'linen'},"fold":true,"members":[]};		
	}

	componentDidMount(){
		fetch('/getMember', {
         method: 'POST',
         headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
         },
          body: JSON.stringify({
			 "groupName":this.props.name
         })
      })
	  .then(function(res){return res.json()})
      .then(json=>{
		  this.setState({"members":json})
      })
	}

	handleTurn(){
		// TODO....
	}

	render() {
		return(
			<div>
				<input type ="button" value="turn on" onClick={this.handleTurn.bind(this)} />
				<div className="GroupItem" style={this.state.style} 
					onMouseEnter={()=>{this.setState({"style":{backgroundColor: '#CCCCCC'}})}}
					onMouseLeave={()=>{this.setState({"style":{backgroundColor: 'linen'}})}}
					onClick={()=>{this.setState({"fold":!this.state.fold})}}
				>
					{this.props.name}<br/>
					{this.state.fold? null : <MemberList members={this.state.members}/>}
				</div>
			</div>
		);
	};
}


class MemberList extends Component{
	constructor(props) {
	    super(props);
	}

	render() {
		return(
			<div className="MemberList">
				{
					this.props.members.map((m,i)=>(
						<div key={i}> {m.member} </div>
					)
				)}
			</div>
		);
	};
}

export default App;
