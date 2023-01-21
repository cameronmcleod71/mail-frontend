document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email(event) {
  event.preventDefault()
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log('hello');
    console.log(result);
    // maybe try to send a visible message that the email either passed or failed
    load_mailbox('sent');
  })
  .catch(error => {
    console.log('Error:',error);
  });
   //might need to catch errors here

  


}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  let get_mailbox = '/emails/' + mailbox;
  fetch(get_mailbox)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);

    emails.forEach( email => {
      create_email(email);
    
    });

    //craete a div, put the email inside
  });

}

function create_email(email) {
  let email_div = document.createElement('div');
  email_div.className = 'email-div';
  // maybe this is not the fastest way to do things, maybe I can write out a html stub using django, and reference it to it here
  email_div.innerHTML = `<span class="sender col-4"><b>${email['sender']}</b></span><span class="subject col-4">${email['subject']}</span><span class="timestamp col-4">${email['timestamp']}</span><br>`;
  if (email['read'] == false) {
    email_div.style.backgroundColor = '#D3D3D3';
  }
  document.querySelector('#emails-view').appendChild(email_div);

  email_div.addEventListener('click', () => {open_email(email['id'])});
}

function open_email(id) {
  //block clear both views, then get the email view ready again
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  document.querySelector('#emails-view').innerHTML = `<h3>Open Mail</h3>`;

  let get_email = '/emails/' + id.toString();
  fetch(get_email)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    let email_div = document.createElement('div');
    email_div.className = 'inne-email-div';

    email_div.innerHTML = `
      <span class="inner-sender"><b>From:</b> ${email['sender']}</span><br>
      <span class="inner-recipients"><b>To:</b> ${email['recipients']}</span><br>
      <span class="inner-subject"><b>Subject:</b> ${email['subject']}</span><br>
      <span class="inner-timestamp"><b>Timestamp:</b> ${email['sender']}</span><br>
      <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>
      <hr>
      <span class="inner-body"> ${email['body']}</span>
      `
    document.querySelector('#emails-view').appendChild(email_div);
    if(email['read'] != true) {
      fetch(get_email, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      });
    }
    document.querySelector('#reply').addEventListener('click',() => {reply(email)});
    document.querySelector('#archive').addEventListener('click', () => {
      let away = false;
      if (email['archived'] == false) { //email is not archived
        away = true;
      }
      fetch(get_email, {
        method: 'PUT',
        body: JSON.stringify({
          archived: away
        })
      })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      }); 
    });


  });
}


function reply(email) {


  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email['sender'];
  document.querySelector('#compose-recipients').disabled = true;
  document.querySelector('#compose-subject').value = 'Re: ' + email['subject'];
  document.querySelector('#compose-subject').disabled = true;
  document.querySelector('#compose-body').value = `On ${email['timestamp']}\n` + email['body'] + '\n';
}