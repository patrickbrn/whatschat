package de.tub.ise.anwsys.controllers;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import de.tub.ise.anwsys.model.Channel;
import de.tub.ise.anwsys.repositories.ChannelRepository;

@RestController
@RequestMapping("/channels")
public class ChannelController {

    @Autowired
    private ChannelRepository channelRepository;


    @GetMapping
    public ResponseEntity getAllChannels(@PageableDefault(page = 0, size = 20) final Pageable pageable,
                                         final PagedResourcesAssembler assembler) {

        //Alle channels werden aus der DB abgefragt
        final Page<Channel> channels = channelRepository.findAll(pageable);

        //Pagination wird mit dem entsprechenden Links generiert
        final PagedResources<Channel> pagedResources = assembler.toResource(channels, ControllerLinkBuilder.linkTo(
                ChannelController.class).withSelfRel());

        return new ResponseEntity(pagedResources, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Channel> createChannel(@RequestBody final Channel channel) {

        //DB Abfrage mit dem Channelname des neuen Channel
        final Optional<Channel> optionalChannel = channelRepository.findByChannelName(channel.getChannelName());
        //falls name schon vergeben -> Fehler: 404
        if (optionalChannel.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        //ansonsten wird der neue channel angelegt
        final Channel result = channelRepository.save(channel);

        //hier wird die location URI generiert und anschliessend als Header eingefügt
        final URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.getId()).toUri();

        return ResponseEntity.created(location).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Channel> getChannelById(@PathVariable(value = "id") final long channelId) {

        final Optional<Channel> channel = channelRepository.findById(channelId);

        //falls kein Channel mit der mitgelieferten ID existiert -> 404
        if (!channel.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().body(channel.get());
    }

    @GetMapping("/{id}/users")
    public ResponseEntity getUsersOfChannel(@PathVariable(value = "id") final long channelId) {


        final List<String> users = channelRepository.findUsersOfChannel(channelId);

        return ResponseEntity.ok(users);
    }

}
