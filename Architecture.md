mywallet architecture documentation
===================================

General Overview
---------------------

mywallet is an application for keeping track of your personal financial
situation. It is mainly a web-application but you can use it offline.
Users can sign up for the application and can add *entries* to *lists*.

An *entry* is a single transaction of money from or to your wallet or bank
account. A user can distinguish between wallets or different bank accounts
by addressing them as a *list*.

Architectural Overview
-------------------------

There are three layers in the mywallet architecture:

1. **Persistence**:  
   The persistence layer does what its name says. It simply holds the
   persistent state of the application, which includes *users*, *lists*,
   *categories* and *entries*.
   
   The persistence layer is implemented as an **Event Store**.
   
2. **Service Layer**:  
   The service layer is mainly responsible for granting access to the
   persistence layer. This means that the layers on top of the service
   layer must authenticate with a user login in order to push events
   to the persistence layer or to recieve events from it.  
   Especially this layer checks for every incoming event if the user,
   which has issued this event, has the rights to do so. Also all outgoing
   events are filtered by this layer to achieve that every client of
   the service layer only sees those events that are related to the
   current user.
   
   The service layer is implemented as an **RESTful web service**.
   
3. **UI Layer**:  
   The UI layer, you won't be surprised, supplies a user interface to
   the application. This means that a user can see the current state
   of his data in the UI and that he can issue changes of this data.
   
   The UI layer is implemented as an **Single-Page web application**. But
   this application is built especially to support mobile devices, and,
   using AppCache, even offline functionality.
     
Event Sourcing
--------------------

As mentioned earlier, the application uses *Event Sourcing* as the
main persistence mechanism. This means that all application state
is described by an append-only event stream.  
In this architecture *events* always describe a user's intent.
This means, that all events (except so-called *service events*)
are an direct equivalent of a specific action of a single user.
For example there is no "Change Entry Data Event", but a "Adjust
Entry Value" event and a "Adjust Entry Date" event.

The *service events* are special events that are used to correct
an invalid application state. For example this happens, if a
"Delete Category" event and a "Create Entry" event happen in
quick succession, given that the created entry has the category
set to the previously deleted category. In this case the application
state is invalid since there is a entry which links to a no more
existent category.  
Then a *service event* is issued by the service layer, which
states that the entry's category was invalid and is now set to
the 'default' category.

This behaviour means, that the application has eventual consistency.
So it is not guaranteed that the application state is always
consistent, but if it is not, it will become consistent in the
near future.

Offline working
--------------------

This form of event sourcing architecture means that the UI can
have a offline mode. To avoid some problems, the UI has to
regard some rules:

* If a user issues some commands on the offline representation
  of the application state, the UI layer has to buffer the events
  in a message queue. But the view must react directly to those
  commands.
  
* Regardless of whether the UI is online or offline, it should
  validate a user's command against the local application state,
  if possible. Then it should send the commands/events to the
  service layer, or buffer it in the message queue to send it later.
  When events arrive, even those the UI has recently pushed to the service
  layer, the UI has to apply the changes described by those events
  to the local model. This has to be a different model than the
  actual view model. After recieving all sent events back, the
  view model has to be rebuilt using the 'backing' local model.
