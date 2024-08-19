import React, { useEffect, useRef, useState } from 'react';
import { FaTrash, FaPen } from 'react-icons/fa';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { CiSearch } from "react-icons/ci";
function App() {
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(() => JSON.parse(localStorage.getItem('topics')) || []);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [topicNotes, setTopicNotes] = useState(() => JSON.parse(localStorage.getItem('topicNotes')) || {});
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const addTopicRef = useRef(null);
  const enterQuestionRef = useRef(null);
  const answerInputRef = useRef(null);
  const notesPerPage = 5;

  useEffect(() => {
    if (addTopicRef.current) {
      addTopicRef.current.focus();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('topicNotes', JSON.stringify(topicNotes));
  }, [topicNotes]);

  const handleInputChange = (e) => {
    if (e.target.name === 'topic') {
      setTopicInput(e.target.value);
    } else if (e.target.name === 'search') {
      setSearchKeyword(e.target.value);
    }
  };

  const handleAddTopic = () => {
    const trimmedTopic = topicInput.trim();
    if (trimmedTopic && !topics.includes(trimmedTopic)) {
      setTopics((prev) => [...prev, trimmedTopic]);
      setTopicInput('');
      setTimeout(() => {
        enterQuestionRef.current.focus();
      }, 0);
    } else if (topics.includes(trimmedTopic)) {
      alert("Topic already exists!");
    }
  };

  const handleDeleteTopic = (index, event) => {
    event.stopPropagation();
    const topicToDelete = topics[index];
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
    setTopicNotes((prevNotes) => {
      const { [topicToDelete]: _, ...rest } = prevNotes;
      return rest;
    });
    if (topicToDelete === selectedTopic) {
      setSelectedTopic(null);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
    setTimeout(() => {
      enterQuestionRef.current.focus();
    }, 0);
  };

  const handleBackAction = () => setSelectedTopic(null);

  const handleQuestionChange = (e) => setQuestion(e.target.value);

  const handleAnswerChange = (e) => setAnswer(e.target.value);

  const handleAddNote = () => {
    if (question.trim() && answer.trim() && selectedTopic) {
      const newNote = { question: question.trim(), answer: answer.trim() };
      setTopicNotes((prevNotes) => ({
        ...prevNotes,
        [selectedTopic]: [...(prevNotes[selectedTopic] || []), newNote],
      }));
      setQuestion('');
      setAnswer('');
      setEditIndex(null);
      enterQuestionRef.current.focus();
    }
  };

  const handleEditNote = (index) => {
    const note = topicNotes[selectedTopic][index];
    setQuestion(note.question);
    setAnswer(note.answer);
    setEditIndex(index);
    setTimeout(() => {
      enterQuestionRef.current.focus();
    }, 0);
  };

  const handleDeleteNote = (index) => {
    setTopicNotes((prevNotes) => ({
      ...prevNotes,
      [selectedTopic]: topicNotes[selectedTopic].filter((_, i) => i !== index),
    }));
    if (editIndex === index) {
      setQuestion('');
      setAnswer('');
      setEditIndex(null);
    }
  };

  const handleSaveEdit = () => {
    if (question.trim() && answer.trim() && selectedTopic !== null && editIndex !== null) {
      const updatedNotes = [...topicNotes[selectedTopic]];
      updatedNotes[editIndex] = { question: question.trim(), answer: answer.trim() };
      setTopicNotes((prevNotes) => ({
        ...prevNotes,
        [selectedTopic]: updatedNotes,
      }));
      setQuestion('');
      setAnswer('');
      setEditIndex(null);
      enterQuestionRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.target === enterQuestionRef.current) {
        answerInputRef.current.focus();
      } else if (e.target === answerInputRef.current) {
        handleAddNote();
      }
    }
  };

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;

  const filteredNotes = Object.entries(topicNotes).reduce((acc, [topic, notes]) => {
    if (selectedTopic === null || selectedTopic === topic) {
      const filtered = notes.filter(note =>
        note.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        note.answer.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      return acc.concat(filtered);
    }
    return acc;
  }, []);  

  const currentNotes = searchKeyword ? filteredNotes : filteredNotes.slice(indexOfFirstNote, indexOfLastNote);  // Apply pagination when not searching
  
  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredNotes.length / notesPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <>
      <nav>
        <h2 className="brand-heading">QA Notes</h2>
        <div className="search-container">
          <CiSearch className="search-icon" />
          <input 
            type="text" 
            name="search" 
            className="search-bar" 
            placeholder="Search" 
            value={searchKeyword} 
            onChange={handleInputChange} 
          />
        </div>
      </nav>
  
      <div className="main">
        <div className="notes-topic">
          {selectedTopic === null ? (
            <>
              <div className="add-topic">
                <input 
                  type="text" 
                  maxLength="40" 
                  value={topicInput} 
                  ref={addTopicRef} 
                  onChange={handleInputChange} 
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()} 
                  placeholder="Enter Topic" 
                  name="topic" 
                />
                <button onClick={handleAddTopic}>Add</button>
              </div>
              <div className="topics-list">
                {topics.length === 0 ? (
                  <p className="welcome-msg">Welcome To QA Notes</p>
                ) : (
                  <p className="topics-list-heading">Select a topic to view or add notes</p>
                )}
                {topics.map((topic, index) => (
                  <div className="topic" key={index} onClick={() => handleTopicClick(topic)}>
                    {index + 1}. {topic}
                    <FaTrash className="trash-icon" onClick={(event) => handleDeleteTopic(index, event)} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="selected-topic">
                <IoArrowBackCircleSharp className="back-btn" onClick={handleBackAction} />
                <h2>{selectedTopic}</h2>
              </div>
              <div className="add-qa">
                <input 
                  type="text" 
                  value={question} 
                  onChange={handleQuestionChange} 
                  onKeyPress={handleKeyPress} 
                  ref={enterQuestionRef} 
                  placeholder="Enter Question" 
                />
                <textarea 
                  value={answer} 
                  onChange={handleAnswerChange} 
                  onKeyPress={handleKeyPress} 
                  ref={answerInputRef} 
                  placeholder="Enter Answer" 
                />
                {editIndex !== null ? (
                  <button onClick={handleSaveEdit}>Save Edit</button>
                ) : (
                  <button onClick={handleAddNote}>Add</button>
                )}
              </div>
            </>
          )}
        </div>
  
        <div className="notes-list">
          {selectedTopic === null ? (
            <>
              {searchKeyword ? (
                filteredNotes.length === 0 ? (
                  <p>No notes found for "{searchKeyword}".</p>
                ) : (
                  <>
                    {currentNotes?.map((note, index) => (
                      <div className="note" key={index}>
                        <div className="note-question">
                          <span>Q{index + 1}.</span>
                          <span>{note.question}</span>
                        </div>
                        <div className="note-answer">
                          <span>Ans{index + 1}.</span>
                          <span>{note.answer}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )
              ) : (
                <p className="no-topic-selected"></p>
              )}
            </>
          ) : (
            <>
              {currentNotes?.map((note, index) => (
                <div className="note" key={indexOfFirstNote + index}>
                  <div className="note-question">
                    <span>Q{indexOfFirstNote + index + 1}.</span>
                    <span>
                      {note.question}
                      <FaPen className="edit-icon" onClick={() => handleEditNote(indexOfFirstNote + index)} />
                      <FaTrash className="delete-icon" onClick={() => handleDeleteNote(indexOfFirstNote + index)} />
                    </span>
                  </div>
                  <div className="note-answer">
                    <span>Ans{indexOfFirstNote + index + 1}.</span>
                    <span>{note.answer}</span>
                  </div>
                </div>
              ))}
              {filteredNotes?.length > notesPerPage && (
                <div className="pagination">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                  <span>Page {currentPage} of {Math.ceil(filteredNotes.length / notesPerPage)}</span>
                  <button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredNotes.length / notesPerPage)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );  
}

export default App;
