// set up experiment logic for each slide
function make_slides(f) {
  var slides = {};

  // set up initial slide
  slides.i0 = slide({
    name: "i0",
    start: function() {
      exp.startT = Date.now();
    }
  });

  // set up the first example slide
  slides.trial = slide({
    name: "trial",
   
    // exp.stimuli stores the stimuli for each trial
    present: exp.stimuli,
    // present_handle gets called for each stimulus in exp.stimuli
    present_handle : function(stim) {

      //record trial start time
      this.trial_start = Date.now();

      //clear all content from "#words"
      $("#words").html("");

      // this delimits the string by spaces
      var words = "these are some words".split(" "); //should be replaced with data from stim
      // for each word in the string, create a span element and display it
      $.each(words, function(idx, value) {
        $("#words").append(
          $("<span>")
            .text(value)
            .data("index", idx))
          .append(" "); // append space after each word
      });


      //when a word (span) is clicked, it will become uppercase and the index of that word will be recorded
      $("#words span").click(function() {
          var elm = $(this);
          // check whether word is currently capitalized by checking whether first character is uppercase
          var isUpper = elm.text()[0] == elm.text()[0].toUpperCase();
          if (isUpper) {
            //make the entire word lowercase (= making the first character lowercase)
            elm.text(elm.text().toLowerCase());
          } else {
            //make the first character uppercase
            elm.text(elm.text()[0].toUpperCase() + elm.text().substr(1));
          }
          _s.log_responses(elm, isUpper);
      });
    },

    log_responses: function(elm, isUpper) {
      // add response to exp.data_trials
      // this data will be submitted at the end of the experiment
      exp.data_trials.push({
        "slide_number_in_experiment": exp.phase,
        "index": elm.data("index"),
        "word": elm.text().toLowerCase(),
        "response_time": Date.now() - this.trial_start,
        "operation": isUpper ? -1 : 1 // 1: capitalize, -1: decapitalize  
      });
    },

    button: function() {
      _stream.apply(this);
    }
  });

  // set up slide for second example trial
  slides.example2 = slide({
    name: "example2",

    start: function() {
      // hide error message
      $(".err").hide();
    },

    // handle button click
    button: function() {
      this.radio = $("input[name='number']:checked").val();
      if (this.radio == "1" || this.radio == "2" || this.radio == "3") {
        this.log_responses();
        exp.go();
      } else {
        $('.err').show();
        this.log_responses();
      }
    },

    log_responses: function() {
      exp.data_trials.push({
        "slide_number_in_experiment": exp.phase,
        "id": "example2",
        "response": this.radio,
        "strangeSentence": "",
        "sentence": "",
      });
    }
  });

  // set up slide with instructions for main experiment
  slides.startExp = slide({
    name: "startExp",
    start: function() {
    },
    button: function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    },
  });

  

  // slide to collect subject information
  slides.subj_info = slide({
    name: "subj_info",
    submit: function(e) {
      exp.subj_data = {
        language: $("#language").val(),
        enjoyment: $("#enjoyment").val(),
        asses: $('input[name="assess"]:checked').val(),
        age: $("#age").val(),
        gender: $("#gender").val(),
        education: $("#education").val(),
        fairprice: $("#fairprice").val(),
        comments: $("#comments").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  //
  slides.thanks = slide({
    name: "thanks",
    start: function() {
      exp.data = {
        "trials": exp.data_trials,
        "catch_trials": exp.catch_trials,
        "system": exp.system,
        "condition": exp.condition,
        "subject_information": exp.subj_data,
        "time_in_minutes": (Date.now() - exp.startT) / 60000
      };
      proliferate.submit(exp.data);
    }
  });

  return slides;
}

/// initialize experiment
function init() {

  exp.trials = [];
  exp.catch_trials = [];
  var stimuli = all_stims;

  exp.stimuli = _.shuffle(stimuli); //call _.shuffle(stimuli) to randomize the order;
  exp.n_trials = exp.stimuli.length;

  // exp.condition = _.sample(["context", "no-context"]); //can randomize between subjects conditions here

  exp.system = {
    Browser: BrowserDetect.browser,
    OS: BrowserDetect.OS,
    screenH: screen.height,
    screenUH: exp.height,
    screenW: screen.width,
    screenUW: exp.width
  };

  //blocks of the experiment:
  exp.structure = [
    "i0",
    "trial",
    "subj_info",
    "thanks"
  ];

  exp.data_trials = [];

  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length();
  //this does not work if there are stacks of stims (but does work for an experiment with this structure)
  //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  $("#start_button").click(function() {
    exp.go();
  });

  exp.go(); //show first slide
}
