package de.tub.ise.anwsys.controllers;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.tub.ise.anwsys.model.Channel;
import de.tub.ise.anwsys.model.Message;
import de.tub.ise.anwsys.repositories.ChannelRepository;
import de.tub.ise.anwsys.repositories.MessageRepository;

@RestController
@RequestMapping("/channels/{id}/messages")

public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getMessagesOfChannel(final PagedResourcesAssembler assembler,
                                               @PathVariable(value = "id") final long channelId,
                                               @RequestParam(required = false)
                                                   @DateTimeFormat(iso = ISO.DATE)
                                                   final Date lastSeenTimestamp) {

        final PagedResources<Message> messagesPaged;

        //prüfung ob channel überhaupt existiert, wenn nicht wird ein 404 zurückgegeben
        final Optional<Channel> channelOptional = channelRepository.findById(channelId);
        if (!channelOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }


        if (lastSeenTimestamp == null) {
           final Pageable pageable = PageRequest.of(0, 10);
           final Page<Message> messages = messageRepository.findByChannelId(channelId, pageable);
            messagesPaged = assembler.toResource(messages, ControllerLinkBuilder.linkTo(
                     ChannelController.class).slash("/" + channelId + "/messages").withSelfRel());
        } else {
            //falls ein Timestamp mitgelifert wird sollen max 50 einträge pro Seite ab dem Zeitpunkt mitgeliefert werden
            messagesPaged = retrievePagedMessagesSinceTimestamp(assembler, channelId, lastSeenTimestamp);
        }

        return new ResponseEntity(messagesPaged, HttpStatus.OK);
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity postMessagesToChannel(@PathVariable(value = "id") final long channelId,
                                                @RequestParam(required = false)
                                                @DateTimeFormat(iso = ISO.DATE)
                                                final Date lastSeenTimestamp,
                                                @RequestBody final Message message,
                                                final PagedResourcesAssembler assembler) {

        //folgendes könnte auch durch ein constraint verhindert werden
        final Optional<Channel> channelOptional = channelRepository.findById(channelId);
        if (!channelOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        //Nachricht dem Channer zuweisen
        message.setChannel(channelOptional.get());
        message.setDate(new Date());

        final Message createdMessage = messageRepository.save(message);

        //falls kein timestamp mitgeliefert wurde wird die neu angelegte Nachricht zurückgegeben
        if (lastSeenTimestamp == null) {
            return ResponseEntity.ok(createdMessage);
        }

        //im anderen Fall werden alle Messages die am diesem Datum oder danach erzeugt worden sind mitgeliefert
        final PagedResources<Message> messagesPages = retrievePagedMessagesSinceTimestamp(assembler, channelId,
                                                                                          lastSeenTimestamp);

        return new ResponseEntity(messagesPages,  HttpStatus.ACCEPTED);
    }


    private PagedResources<Message> retrievePagedMessagesSinceTimestamp(final PagedResourcesAssembler assembler,
                                                                        final long channelId,
                                                                        final Date lastSeenTimestamp) {


        final Pageable pageable = PageRequest.of(0, 50);
        final Page<Message> messages = messageRepository.findByChannelIdAndDateGreaterThanEqual(channelId,
                                                                                                lastSeenTimestamp,
                                                                                                pageable);

         return assembler.toResource(messages, ControllerLinkBuilder.linkTo(
                ChannelController.class).slash("/" + channelId + "/messages").withSelfRel());

    }
}
