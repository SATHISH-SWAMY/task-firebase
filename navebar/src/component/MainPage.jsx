import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import toast, { Toaster } from 'react-hot-toast';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Autocomplete, Checkbox, DialogContentText, Input, TextField } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import Slide from '@mui/material/Slide';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import './mainDesign.css'
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import CircularProgress from '@mui/joy/CircularProgress';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import CloseIcon from '@mui/icons-material/Close';
import Avatar from '@mui/material/Avatar';
import Warning from '@mui/icons-material/Warning';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { auth, db } from './FireBase';
import { setDoc, doc, getDoc, collection, addDoc, getDocs, onSnapshot, query, where, orderBy } from 'firebase/firestore';

// ..




const drawerWidth = 240;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const listOfTask = [
  { taskname: 'DESIGNER HEAD', completed: false, locked: false, description: 'Task-1-description', assignedUsers: ["Design Head"] },
  { taskname: 'SIGHT MEASUREMENT', completed: false, locked: true, description: 'Task-2-description', assignedUsers: [] },
  { taskname: 'DESIGNER-Task-1', completed: false, locked: true, description: 'Task-3-description', assignedUsers: [] },
  { taskname: 'DESIGNER-Task-2', completed: false, locked: true, description: 'Task-4-description', assignedUsers: [] },
  { taskname: 'DESIGNER-Task-3', completed: false, locked: true, description: 'Task-5-description', assignedUsers: [] },
  { taskname: 'Production Drawing', completed: false, locked: true, description: 'Task-5-description', assignedUsers: [] },
];
const listOfSubTask = [
  { taskname: 'eded', description: 'eded', parentId: 'SIGHT MEASUREMENT' },
  { taskname: 'ed', description: 'eded', parentId: 'DESIGNER-Task-1' },
  { taskname: 'dc', description: 'dc', parentId: 'DESIGNER-Task-2' },
  { taskname: 'dcd', description: 'cdc', parentId: 'DESIGNER-Task-3' },
  { taskname: 'dcd', description: 'cdc', parentId: 'Production Drawing' },
];



const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));



export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [dilogOpen, setDilogOpen] = React.useState(false);
  const [subTaskStore, setSubTaskStore] = React.useState(() => {
    const savedSubTasks = localStorage.getItem('saveSubTask');
    return savedSubTasks ? JSON.parse(savedSubTasks) : listOfSubTask;
  });
  console.log("SubTaskStore", subTaskStore);

  const [storeTask, setStoreTask] = React.useState(() => {
    // Load tasks from local storage when the component mounts
    const savedTasks = localStorage.getItem('tasks');
    console.log("savedTasks", savedTasks);


    return savedTasks ? JSON.parse(savedTasks) : listOfTask;
  });
  console.log("storeTask", storeTask);


  const [typingTaskName, setTypingTaskName] = React.useState('');
  const [typingDiscription, setTypingDiscription] = React.useState('');
  console.log("typingDiscription", typingDiscription);

  const [selectedTaskIndex, setSelectedTaskIndex] = React.useState(null);

  const [isUpdateMode, setIsUpdateMode] = React.useState(false);
  const [visibleTasks, setVisibleTasks] = React.useState({});
  const [hiddenTasks, setHiddenTasks] = React.useState([]);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [completedTaskName, setCompletedTaskName] = React.useState('');

  console.log("completedTaskName", completedTaskName);
  // Save tasks to local storage whenever the task list changes
  React.useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(storeTask));
  }, [storeTask]);



  const CreateSubTask = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Define the path to the user's subcollection for subtasks
          const userSubTaskCollection = collection(db, "Users", user.uid, "SubTasks");

          await addDoc(userSubTaskCollection, {
            taskname: typingTaskName,
            description: typingDiscription,
            parentId: selectedTaskid.taskname, // Store the parent task's name or ID
          });

          // Reset fields and show success message
          setTypingTaskName('');
          setTypingDiscription('');
          handleSubTaskDialogOpen(false);
          toast.success("Subtask has been created");

        } catch (error) {
          console.error("Error creating subtask:", error.message);
          toast.error("Failed to create subtask");
        }
      } else {
        console.log("No user is signed in.");
        toast.error("Please log in to create a subtask.");
      }
    });
  };

  const fetchUserSubTasks = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Reference the user's subcollection for subtasks
          const userSubTaskCollection = collection(db, "Users", user.uid, "SubTasks");

          // Fetch all documents (subtasks) in this subcollection
          const subTaskSnapshot = await getDocs(userSubTaskCollection);
          console.log("subTaskSnapshot", subTaskSnapshot);

          const fetchedSubTasks = subTaskSnapshot.docs.map(doc => ({
            id: doc.id, // Store document ID if needed
            ...doc.data() // Spread document data
          }));

          // Update state with fetched subtasks
          setSubTaskStore(fetchedSubTasks);

        } catch (error) {
          console.error("Error fetching subtasks:", error.message);
          toast.error("Failed to fetch subtasks");
        }
      } else {
        console.log("No user is signed in.");
        toast.error("Please log in to view your subtasks.");
      }
    });
  };

  // Use useEffect to fetch data when the component mounts or user state changes
  React.useEffect(() => {
    fetchUserSubTasks();
  }, []);


  // const CreateSubTask = () => {
  //   const newTask = {
  //     taskname: typingTaskName,
  //     description: typingDiscription,
  //     parentId: selectedTaskid.taskname, // Store the parent task's ID or name
  //   };

  //   setSubTaskStore([...subTaskStore, newTask]);
  //   setTypingTaskName('');
  //   setTypingDiscription('');
  //   handleSubTaskDialogOpen(false)
  //   toast.success("Sub task has been created")
  // }

  const createNewTask = () => {
    const newTask = {
      taskname: typingTaskName,
      completed: false,
      locked: true,
      discription: typingDiscription,
    };

    const updatedTasks = [...storeTask]; // Create a copy of the task array
    let newTaskIndex;

    if (selectedTaskIndex !== null) {
      updatedTasks.splice(selectedTaskIndex + 1, 0, newTask); // Insert the new task after the selected task
      newTaskIndex = selectedTaskIndex + 1;
    } else {
      updatedTasks.push(newTask); // Add new task to the end if no task is selected
      newTaskIndex = updatedTasks.length - 1;
    }

    setStoreTask(updatedTasks); // Update the task list in the state


    // Reset dialog state
    setTypingTaskName('');
    setTypingDiscription('');
    setDilogOpen(false);

    // Call useEffect to manage hidden tasks
    setHiddenTasks((prev) => [...prev, newTaskIndex]);
  };

  React.useEffect(() => {
    if (hiddenTasks.length > 0) {
      const updatedVisibleTasks = { ...visibleTasks };

      // Hide tasks based on hiddenTasks state
      hiddenTasks.forEach((index) => {
        updatedVisibleTasks[index] = false; // Set the visibility of the new task to false
      });

      setVisibleTasks(updatedVisibleTasks);
    }
  }, [hiddenTasks]);



  const handleUpdateTask = () => {
    const timestamp = new Date().toLocaleString(); // Get readable date and time
    const updatedTasks = storeTask.map((task, index) =>
      index === selectedTaskIndex
        ? {
          ...task,
          taskname: typingTaskName,
          discription: [
            ...(task.discription || []), // Keep existing descriptions
            { timestamp, text: typingDiscription } // Add new description with formatted timestamp
          ]
        }
        : task
    );

    setStoreTask(updatedTasks);
    setDilogOpen(false);
    setIsUpdateMode(false); // Exit update mode
    setTypingTaskName('');
    setTypingDiscription('');
  };



  const handleCompleteTask = (index) => {
    setSelectedTaskIndex(index);

    const updatedTasks = storeTask.map((task, idx) => {
      if (idx === index) {
        // Mark the current task as completed and locked
        return { ...task, completed: true, locked: true };
      }

      // If the completed task is the first task (index 0), unlock all remaining tasks
      if (index === 0) {
        return { ...task, locked: false };
      }

      // For all other cases, keep the tasks as they are
      return task;
    });

    // Update the tasks in state
    setStoreTask(updatedTasks);

    // Set the name of the completed task for the alert
    setCompletedTaskName(updatedTasks[index].taskname);

    // Show the alert and hide it after 2 seconds
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2000);

    // Show the toast notification
    toast.success(`Task "${updatedTasks[index].taskname}" completed successfully!`, {
      duration: 3000, // Duration for the toast to be visible (3 seconds)
    });
  };


  const handleDrawerOpen = () => {
    setOpen(true);
  };




  const handleClose = () => {
    setDilogOpen(false);
  };

  const handleDialogOpen = (index, updateMode = false) => {
    setSelectedTaskIndex(index);
    setIsUpdateMode(updateMode); // Set update mode based on action
    if (updateMode) {
      const taskToUpdate = storeTask[index];
      setTypingTaskName(taskToUpdate.taskname);
      setTypingDiscription(taskToUpdate.discription);
    }
    setDilogOpen(true);
  };

  const toggleTasksVisibility = (index) => {
    setVisibleTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };




  const [selectedSightMeasurement, setSelectedSightMeasurement] = React.useState(null);
  const [selectedDesigner, setSelectedDesigner] = React.useState(null);
  const [selectedProductionDrawing, setSelectedProductionDrawing] = React.useState(null);
  const [openAuthoriziation, setOpenAuthoriziation] = React.useState(false);
  const [selectedName, setSelectedName] = React.useState([]);
  console.log("selectedName", selectedName);
  const [selectedTaskid, setSelectedTaskid] = React.useState([])
  console.log("selectedTaskid", selectedTaskid);





  const sightMesurement = [
    { label: 'Gabrielle Villalobos' },
    { label: 'Leo Hardin' },
    { label: 'Vada Weber' },
  ];

  const designers = [
    { label: 'Bear Horne' },
    { label: 'The Godfather' },
    { label: 'Crew Sweeney' },
  ];

  const productionDrawing = [
    { label: 'Brixton Nash' },
    { label: 'Nikolas Dyer' },
    { label: 'Pulp Fiction' },
  ];


  const createAuthorizations = () => {
    const authorizations = {
      sightMeasurement: selectedSightMeasurement.label,
      designer: selectedDesigner.label,
      productionDrawing: selectedProductionDrawing.label,
    };

    // Update the first unlocked task with the assigned users
    const updatedTasks = storeTask.map((task) => {
      if (task.taskname === 'SIGHT MEASUREMENT') {
        return {
          ...task,
          assignedUsers: [authorizations.sightMeasurement], // Assign sight measurement user
        };
      } else if (task.taskname === 'DESIGNER-Task-1' || task.taskname === 'DESIGNER-Task-2' || task.taskname === 'DESIGNER-Task-3') {
        return {
          ...task,
          assignedUsers: [authorizations.designer], // Assign designer user
        };
      } else if (task.taskname === 'Production Drawing') {
        return {
          ...task,
          assignedUsers: [authorizations.productionDrawing], // Assign production drawing user
        };
      }

      // If no matching task, return the task as-is
      return task;
    });

    setStoreTask(updatedTasks);

    // Show success toast notification
    toast.success('Authorizations have been successfully updated!',)

    // Close the modal
    setOpenAuthoriziation(false);
  };


  const HandleCloseAuthorization = () => {
    setOpenAuthoriziation(false);
  };

  const HandleOpenAuthorization = () => {
    setOpenAuthoriziation(true);
  }


  const [openTaskEditor, setOpenTaskEditor] = React.useState(false)
  const [subTaskOpen, setSubTaskOpen] = React.useState(false)



  const toggleSidebar = () => {
    setOpenTaskEditor((prev) => !prev);
  };
  const handleSubTaskDialogOpen = () => {
    setSubTaskOpen((prev) => !prev);
  };


  const handleTaskSelection = (index) => {
    setSubTaskStore((prevStore) =>
      prevStore.map((task, i) =>
        i === index ? { ...task, selected: true } : task
      )
    );
  };

  const [userDetails, setUserDetails] = React.useState(null)
  console.log("userDetails", userDetails);



  const fetchUserDetails = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User:", user);
        const docRef = doc(db, "user", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          console.log("c:", docSnap.data());
        } else {
          console.log("No user data found in Firestore.");
        }
      } else {
        console.log("User is not logged in.");
      }
    });
  };

  React.useEffect(() => {
    fetchUserDetails()
  }, [])

  async function handleLogOut() {
    try {
      await auth.signOut();
      window.location.href = "/login"
      console.log("User is logged out successfully.");

    } catch (error) {
      console.log(error.message);

    }
  }

  const [openChat, setOpenChat] = React.useState(true)
  const [newMessage, setNewMessage] = React.useState('')
  console.log(newMessage)


  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (newMessage.trim() === "") return;

    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const messageRef = doc(db, "chatMessages", `${new Date().getTime()}_${user.uid}`);
      await setDoc(messageRef, {
        message: newMessage,
        timestamp: new Date(),
        userId: user.uid,
        name: user.displayName || "Anonymous",
        userImage: userDetails?.image || ""
      });

      console.log("Message sent:", newMessage);
      toast.success("Message sent!");

      setNewMessage('');

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const [messages, setMessages] = React.useState([]);
  console.log("Received messages", messages);



  const user = auth.currentUser;
  console.log("short", user);
  const messageRef = collection(db, "chatMessages");

  React.useEffect(() => {

    const queryMessage = query(messageRef, orderBy("timestamp", "asc"));


    onSnapshot(queryMessage, (snapshot) => {
      let fetchedMessages = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(fetchedMessages);
    });

  }, []);





  return (
    <Box sx={{ display: 'flex', backgroundColor: '', height: '100%' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar
          sx={{
            background: '#FF964L', // Futuristic gradient background
            padding: '10px 20px', // Adjust padding
            transition: 'all 0.3s ease-in-out', // Smooth transition

          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: 'none' }),
              transition: 'transform 0.3s ease', // Smooth transition for icon
              '&:hover': {
                transform: 'scale(1.1)', // Slightly scale up on hover
              },
            }}
          >
            {/* <MenuIcon /> */}
          </IconButton>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            marginLeft: 'auto',
            width: '100%',
          }} >

            <Typography variant="h6" noWrap component="div" sx={{
              color: 'white', // Change text color for better contrast
              fontWeight: 'bold', // Bold font weight
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', // Text shadow for depth
            }}>
              TASKS LIST
            </Typography>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',

            }} >
              <Button onClick={handleLogOut} variant="contained" color="primary" sx={{ margin: '10px', backgroundColor: "red" }}>Logout</Button>
              <AccountCircleIcon />
              {
                userDetails ? (
                  <>
                    <p>{userDetails.email}</p>


                  </>
                ) : (
                  <p>Looding.....</p>
                )
              }
            </div>

          </div>

        </Toolbar>

      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Divider />
        {/* Add any additional drawer content here */}

      </Drawer>

      <Main open={open}>
        <Box sx={{
          marginBottom: '10px',
          marginTop: '20vh',
        }}

        >

          {!openChat && (
            <form onSubmit={handleChatSubmit}
              style={{
                position: "absolute",
                width: "300px",
                height: "400px",
                backgroundColor: "#1E90FF",
                borderRadius: "10px",
                right: "5vh",
                bottom: "10vh",
                border: "2px solid #000",
                color: "white",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderBottom: "1px solid #ccc",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                <h1 style={{ fontSize: "18px", margin: 0 }}>Chat List</h1>
                <div
                  onClick={() => setOpenChat(true)}
                  style={{
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  ✖️
                </div>
              </div>

              

              <div
                style={{
                  flex: 1,
                  padding: "15px",
                  overflowY: "auto",
                }}
              >
                {/* Add message preview here */}
                {messages.map((text) => {
                  return (
                    <div
                      className="scroolBar"
                      key={text.id} // Add a unique key for each message
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ccc",
                        backgroundColor: text.userId === auth.currentUser.uid ? "#E6E6E6" : "#ffffff",
                        borderRadius: "5px",
                        marginBottom: "10px",
                        marginLeft: "10px",
                        color: "black",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        maxWidth: "80%", // Limit the width of each message box
                        overflowWrap: "break-word", // Handle long words by wrapping them
                        whiteSpace: "pre-wrap", // Preserve whitespace and wrap text if it overflows
                        wordWrap: "break-word", // Handle line breaks properly
                      }}
                    >
                      {text.name}: {text.message} {text.timestamp?.toDate().toLocaleString()}
                    </div>
                  );
                })}

              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 15px",
                  borderTop: "1px solid #ccc",
                  backgroundColor: "#ffffff",
                  borderRadius: "0 0 10px 10px",
                }}
              >
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    color: "black",
                    marginRight: "10px",
                    caretColor: "transparent", // Hides the cursor
                  }}
                />
                <button
                  type='submit'
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#00BFFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          )}

          <div  >
            <WhatsAppIcon onClick={() => setOpenChat(!openChat)} style={{
              fontSize: '50px',
              position: "absolute",
              right: "5vh",
              bottom: "5vh",
              cursor: "pointer",
              color: "green"
            }} />
          </div>


          {storeTask.map((task, index) => {
            const isTaskVisible = visibleTasks[index]; // Check if the task is visible
            const isTaskCompleted = task.completed;
            const isTaskLocked = task.locked;
            const allSubTasks = subTaskStore.filter(subtask => subtask.parentId === task.taskname).length
            const clickedTasks = subTaskStore.filter(subtask => subtask.parentId === task.taskname && subtask.selected).length
            console.log("isTaskCompleted", isTaskCompleted);
            const allSubtasksCompleted = allSubTasks === clickedTasks;

            console.log("allSubTasks", allSubTasks);
            const selectedTask = selectedTaskid
            console.log("selectedTask", selectedTask);
            const selectedSubtask = subTaskStore.find(subtask => subtask.selected) || null;

            // Check if there's a selected subtask
            const hasSelectedSubtask = selectedSubtask !== null;
            console.log("Sathish: Has selected subtask:", selectedSubtask);

            return (
              <Box key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  fontFamily: 'Roboto, sans-serif', // Change to your desired font family
                  gap: 6,
                  marginTop: '1vh',
                  cursor: 'pointer',
                  transition: theme.transitions.create('background-color'),

                }} >



                {/* Task Card */}

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Card
                    onClick={() => {
                      setSelectedTaskid(task, index)
                      toggleSidebar()
                    }
                    }
                    sx={{
                      width: '100vh',
                      display: 'flex',
                      backgroundColor: isTaskCompleted
                        ? '#FF964A'
                        : isTaskLocked
                          ? '#AFB1B3'
                          : '#AE5138',
                      justifyContent: 'center',
                      fontFamily: 'Roboto, sans-serif', // Font family applied to the Card as well
                      position: 'relative',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)', // Initial shadow
                      transition: 'all 0.3s ease', // Smooth transition

                    }}
                  >
                    <CardActionArea>
                      <CardContent>

                        <Typography gutterBottom variant="h5" component="div" sx={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px' }} >
                          {task.taskname}
                        </Typography>
                        {/* Show description if the task is visible */}




                      </CardContent>
                    </CardActionArea>




                    {/* Display Avatars for assigned users */}
                    {task.assignedUsers && task.assignedUsers.length > 0 ? (
                      <Stack style={{
                        cursor: isTaskLocked ? "not-allowed" : "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        color: 'black',
                        marginTop: '0.1vh',
                        marginRight: '10vh',
                      }} direction="row" spacing={1}>
                        {task.assignedUsers.map((user, userIndex) => (
                          <Avatar key={userIndex} alt={user} src={`/static/images/avatar/${userIndex + 1}.jpg`} />
                        ))}
                      </Stack>
                    ) : (
                      index > 0 && (
                        <AccountCircleIcon
                          style={{
                            cursor: isTaskLocked ? "not-allowed" : "pointer",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            color: 'white',
                            marginTop: '1.5vh',
                            marginRight: '10vh',
                          }}
                        />
                      )
                    )}


                    {/* <IconButton aria-label="more" onClick={() => toggleTasksVisibility(index)}>
                        <ArrowDropDownIcon />
                      </IconButton> */}
                  </Card>

                  {!isTaskCompleted && !isTaskLocked && allSubtasksCompleted && (
                    <div style={{ display: "flex", gap: '1vh' }}>
                      {index < 1 ? (
                        <Button
                          sx={{
                            position: 'relative',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)',
                              transform: 'translateY(-2px)',
                            },
                            '&:active': {
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
                              transform: 'translateY(1px)',
                            }
                          }}
                          variant="outlined"
                          color="success"
                          onClick={HandleOpenAuthorization}
                        >
                          Assign
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="success"
                          sx={{
                            position: 'relative',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)',
                              transform: 'translateY(-2px)',
                            },
                            '&:active': {
                              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
                              transform: 'translateY(1px)',
                            }
                          }}
                          onClick={() => handleDialogOpen(index, true)}
                        >
                          Update
                        </Button>
                      )}
                      <Button
                        sx={{
                          position: 'relative',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)',
                            transform: 'translateY(-2px)',
                          },
                          '&:active': {
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
                            transform: 'translateY(1px)',
                          }
                        }}
                        variant="outlined"
                        color="success"
                        onClick={() => handleCompleteTask(index)}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                  <Toaster
                    position="top-center"
                    reverseOrder={false} />
                </Box>
                {isTaskVisible && <Box sx={{
                  marginTop: 2,
                  width: '100vh',
                  height: 'auto',
                  backgroundColor: "#FFFCE1",
                  borderRadius: '10px',
                  padding: '5px 15px 5px 15px ',
                  fontFamily: 'Roboto, sans-serif', // Font family applied to the Card as well
                  position: 'relative',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)', // Initial shadow
                  transition: 'all 0.3s ease', // Smooth transition
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)', // Shadow on hover
                    transform: 'translateY(-2px)', // Lift effect on hover
                  },
                  '&:active': {
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)', // Shadow when pressed
                    transform: 'translateY(1px)', // Press down effect
                  }
                }} >

                  {Array.isArray(task.discription) && task.discription.length > 0 && task.discription.map((entry, entryIndex) => (
                    <Box key={entryIndex} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" sx={{ color: 'gray', fontSize: '12px' }}>
                        {entry.timestamp}
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '14px', marginTop: '4px' }}>
                        {entry.text}
                      </Typography>
                    </Box>
                  ))}



                </Box>}

                {/* <div data-aos="fade-up" data-aos-duration="1000"
                >

                  {!isTaskCompleted && !isTaskLocked && (
                    <Button sx={{
                      position: 'relative',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)', // Initial shadow
                      transition: 'all 0.3s ease', // Smooth transition
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.35)', // Shadow on hover
                        transform: 'translateY(-2px)', // Lift effect on hover
                      },
                      '&:active': {
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)', // Shadow when pressed
                        transform: 'translateY(1px)', // Press down effect
                      }
                    }} variant="outlined" color="error" onClick={() => handleDialogOpen(index)}>
                      <AddIcon />

                    </Button>
                  )}
                </div> */}






                {/* Success Alert Message */}
                {/* {alertVisible && (
                  <Box>
                    <Stack
                      spacing={2}
                      sx={{
                        maxWidth: 400,
                        position: "fixed",
                        top: 60,
                        right: 0,
                        margin: '10px',
                        zIndex: 1000, // Ensure it appears above other elements
                        pointerEvents: 'none', // Prevent interference with other content
                      }}
                      data-aos="fade-left" // AOS slide effect
                      data-aos-anchor="#example-anchor"
                      data-aos-offset="500"
                      data-aos-duration="5000"
                    >
                      <Alert
                        size="lg"
                        color="success"
                        variant="solid"
                        invertedColors
                        startDecorator={
                          <AspectRatio
                            variant="solid"
                            ratio="1"
                            sx={{
                              minWidth: 40,
                              borderRadius: '50%',
                              boxShadow: '0 2px 12px 0 rgb(0 0 0/0.2)',
                            }}
                          >
                            <div>
                              <Check fontSize="xl2" />
                            </div>
                          </AspectRatio>
                        }
                        endDecorator={
                          <IconButton
                            variant="plain"
                            sx={{
                              '--IconButton-size': '32px',
                              transform: 'translate(0.5rem, -0.5rem)',
                            }}
                          >
                            <Close />
                          </IconButton>
                        }
                        sx={{ alignItems: 'flex-start', overflow: 'hidden' }}
                      >
                        <div>
                          <Typography level="title-lg">{completedTaskName}</Typography>
                          <Typography level="body-sm">
                            has been completed successfully.
                          </Typography>
                        </div>
                        <LinearProgress
                          variant="solid"
                          color="success"
                          value={40}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            borderRadius: 0,
                          }}
                        />
                      </Alert>
                    </Stack>
                  </Box>
                )} */}






                {/* DESIGNER ASSIGNING FORM */}

                <Box>
                  <React.Fragment>
                    <BootstrapDialog
                      onClose={HandleCloseAuthorization}
                      aria-labelledby="customized-dialog-title"
                      open={openAuthoriziation}
                      sx={{
                        '& .MuiDialog-paper': {
                          backgroundColor: 'white', // Set transparent background for the dialog
                        },
                      }}
                      BackdropProps={{
                        style: {
                          backgroundColor: 'transparent', // Ensure the backdrop is also transparent (if needed)
                        },
                      }}
                    >
                      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        Access Control
                      </DialogTitle>
                      <IconButton
                        aria-label="close"
                        onClick={HandleCloseAuthorization}
                        sx={(theme) => ({
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          color: theme.palette.grey[500],
                        })}
                      >
                        <CloseIcon />
                      </IconButton>
                      <DialogContent dividers>
                        <Box>
                          <Box
                            sx={{
                              width: '60vh',
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                margin: '10px 10px 25px 10px',
                              }}
                            >
                              <p>SIGHT MEASUREMENT</p>
                              <div>
                                <Autocomplete
                                  disablePortal
                                  options={sightMesurement}
                                  sx={{ width: '30vh' }}
                                  renderInput={(params) => <TextField {...params} />}
                                  onChange={(event, newValue) => setSelectedSightMeasurement(newValue)}
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                margin: '10px 10px 25px 10px',
                              }}
                            >
                              <p>DESIGNERS</p>
                              <div>
                                <Autocomplete
                                  disablePortal
                                  options={designers}
                                  sx={{ width: '30vh' }}
                                  renderInput={(params) => <TextField {...params} />}
                                  onChange={(event, newValue) => setSelectedDesigner(newValue)}
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                margin: '10px 10px 25px 10px',
                              }}
                            >
                              <p>PRODUCTION DRAWING</p>
                              <div>
                                <Autocomplete
                                  disablePortal
                                  options={productionDrawing}
                                  sx={{ width: '30vh' }}
                                  renderInput={(params) => <TextField {...params} />}
                                  onChange={(event, newValue) => setSelectedProductionDrawing(newValue)}
                                />
                              </div>
                            </div>
                          </Box>
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={HandleCloseAuthorization}>Cancel</Button>

                        <Button onClick={createAuthorizations}>Save changes</Button>
                      </DialogActions>
                    </BootstrapDialog>
                  </React.Fragment>
                </Box>



              </Box>
            );
          })}

          <Box>






            {/* Sidebar */}
            {openTaskEditor && (
              <Box
                sx={{
                  width: '50%',
                  height: '90%',
                  position: 'absolute',
                  marginTop: "7vh",
                  top: 0,
                  right: 0,
                  padding: '10px',
                  backgroundColor: 'gray',
                  transition: 'transform 0.3s ease',
                  transform: openTaskEditor ? 'translateX(0)' : 'translateX(100%)',
                  border: '2px solid black',
                  borderRadius: '10px',
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: "center",
                }}>
                  <div>{selectedTaskid.taskname}</div>
                  <div
                    onClick={() => toggleSidebar()}
                    style={{
                      fontSize: '30px',
                      cursor: "pointer"
                    }}
                  ><Button variant="outlined" color="error">
                      <CloseIcon />
                    </Button></div>
                </div>
                <hr style={{
                  backgroundColor: "black",
                  margin: "10px 0 10px 0"
                }} />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '10px',
                  margin: '5px 5px 5px 5px',
                  padding: '10px',
                  backgroundColor: '#f2f2f2',
                  borderRadius: '10px',
                  padding: '10px',
                  border: '1px solid black',

                }}>

                  <div >
                    <p>{selectedTaskid.description}</p>
                  </div>

                  <div>
                    {selectedTaskid.assignedUsers && selectedTaskid.assignedUsers.length > 0 && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px "
                      }} >
                        <AccountCircleIcon style={{
                          fontSize: "30px",
                        }} />
                        {selectedTaskid.assignedUsers.map((user, index) => (
                          <div key={index}>{user}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  gap: '10px',
                  margin: '10vh 5vh 5vh 5vh ',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: "space-between"


                }} >
                  <Button style={{ backgroundColor: 'white' }} onClick={() => handleSubTaskDialogOpen(true)}>Create Subtask</Button>
                  <div>
                    {/* Count of subtasks specific to the selected task */}
                    {`Length: ${subTaskStore.filter(task => task.parentId === selectedTaskid.taskname).length}`}/
                    {subTaskStore.filter(task => task.parentId === selectedTaskid.taskname && task.selected).length}
                  </div>
                </div>
                <hr style={{
                  backgroundColor: "black",
                  margin: "5px 0 20px 0"
                }} />
                <div>
                  {/* Display only subtasks associated with selectedTaskid */}
                  {Array.isArray(subTaskStore) && subTaskStore
                    .filter(task => task.parentId === selectedTaskid.taskname) // Filter for selected task's subtasks
                    .map((task, index) => (
                      <Box
                        key={index}

                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '10px',
                          marginBottom: '10px',
                          marginTop: '10px',
                          cursor: 'pointer',
                          transition: theme.transitions.create('background-color'),
                          borderRadius: '5px',
                          padding: '10px',
                          backgroundColor: task.selected ? 'orange' : '#f2f2f2',
                          cursor: task.selected ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.3s ease',
                          '&:hover': {
                            backgroundColor: task.selected ? 'orange' : '#e6e6e6',
                          },
                        }}
                      >
                        <div>
                          <p>Task name: {task.taskname}</p>
                          <p>Task description: {task.description}</p>
                        </div>
                        <div>
                          <Checkbox onClick={() => handleTaskSelection(subTaskStore.findIndex(t => t === task))} disabled={task.selected} />
                        </div>
                      </Box>
                    ))}
                </div>
              </Box>
            )}


            {/* sub-task-menu */}
            <React.Fragment>
              <Dialog
                open={subTaskOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>Create New Subtask</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="taskname"
                    label="Task Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={typingTaskName}
                    onChange={(e) => setTypingTaskName(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    id="discription"
                    label="Description"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={typingDiscription}
                    onChange={(e) => setTypingDiscription(e.target.value)}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => handleSubTaskDialogOpen(true)}>Cancel</Button>
                  <Button onClick={CreateSubTask}>Add Task</Button>
                </DialogActions>
              </Dialog>
            </React.Fragment>






          </Box>

        </Box>


      </Main>

      {/* <Dialog open={subTaskOpen} onClose={handleClose}>
        <DialogTitle>{isUpdateMode ? 'Update Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="taskname"
            label="Task Name"
            type="text"
            fullWidth
            variant="standard"
            value={typingTaskName}
            onChange={(e) => setTypingTaskName(e.target.value)}
          />
          <TextField
            margin="dense"
            id="discription"
            label="Description"
            type="text"
            fullWidth
            variant="standard"
            value={typingDiscription}
            onChange={(e) => setTypingDiscription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubTaskDialogOpen(true)}>Cancel</Button>
          <Button onClick={isUpdateMode ? handleUpdateTask : createNewTask}>
            {isUpdateMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
}
